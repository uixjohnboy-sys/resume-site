// Run: node --experimental-strip-types scripts/tapline-rules.test.mjs
// The keyword rules are the fallback when the AI is unavailable and the safety
// net that can only raise urgency. These cases include the G4 review's misses.
import { emergencyText, isSmokeAlarm, ruleTriage, rulesOnlyUrgency } from "../src/lib/tapline/rules.ts";

const cases = [
  // [text, trade (null = any), urgency, hazard that must be found (optional)]
  ["Water coming through the ceiling. Brown stain and it is dripping into a bucket.", "plumber", "urgent", "flood"],
  ["Kitchen tap dripping. The mixer tap drips constantly.", "plumber", "routine"],
  ["Toilet keeps running. Cistern refills every few minutes.", "plumber", "routine"],
  ["No hot water. Hot water system stopped, only cold.", "plumber", "urgent"],
  ["Power point sparking. Sparked when I plugged in a lamp, smells burnt.", "electrician", "urgent", "electric"],
  ["Bathroom light not working. Changed the globe but still off.", "electrician", "routine"],
  ["Front door will not lock. Deadbolt jammed, we cannot lock the house.", "locksmith", "urgent", "security"],
  ["Wardrobe door off its track.", "handyman", "routine"],
  ["Gutter overflowing. Back gutter overflows when it rains, water runs down the wall.", "roofer", "routine"],
  ["Air con not cooling. Split system blows warm air.", "hvac", "routine"],
  ["Mice in the kitchen. Droppings in the pantry.", "pest", "routine"],
  ["Cracked window pane in the bedroom.", "glazier", "routine"],
  ["Ceiling fan wobbling in the lounge.", "electrician", "routine"],
  ["I can smell gas near the cooktop.", "gas", "urgent", "gas"],
  ["Boiler stopped, no heating and it is freezing.", "hvac", "urgent"],
  ["Toilet is overflowing onto the bathroom floor.", "plumber", "urgent", "flood"],
  ["My laptop charger stopped working in the study.", "handyman", "routine"],
  ["The light switch in the hallway sparks.", "electrician", "urgent", "electric"],
  ["Smoke alarm keeps beeping, I think it needs a battery.", "electrician", "routine"],
  // G4 AI Quality Lead misses
  ["Carbon monoxide alarm going off in the kitchen and we have headaches.", "gas", "urgent", "co"],
  ["The back door won't lock after someone tried to force it.", "locksmith", "urgent", "security"],
  ["The bedroom ceiling is sagging and has a big damp patch.", null, "urgent", "ceiling"],
  ["Water dripping from the light fitting in the bathroom.", null, "urgent", "electricWater"],
  ["No gas smell, just the cooktop burner won't light.", "gas", "routine"],
  ["Sparkling clean after the cleaners, just a loose cupboard hinge.", "handyman", "routine"],
  ["Floodlight above the garage has stopped working.", "electrician", "routine"],
  ["Gas Safety certificate due next month.", "gas", "routine"],
  ["Someone broke in overnight and smashed the back door glass.", null, "urgent", "security"],
  ["Black mould on the bedroom wall behind the wardrobe.", "damp", "routine"],
  // G4 round 2 (AI Quality Lead N-13 to N-22): everyday "fire" words are not emergencies; missed phrases.
  ["Gas fire won't light in the lounge.", "gas", "routine"],
  ["The fire alarm keeps chirping every minute.", "electrician", "routine"],
  ["Fire door in the hallway won't close by itself.", null, "routine"],
  ["Electric fire in the bedroom stopped working.", "electrician", "routine"],
  ["There's a smell of burning from the power point.", "electrician", "urgent", "fire"],
  ["Flames coming out of the oven.", null, "urgent", "fire"],
  ["Water dripping out of the ceiling light in the kitchen.", null, "urgent", "electricWater"],
  ["I got a shock from the kitchen tap.", null, "urgent", "electric"],
  ["Part of the bathroom ceiling has fallen in.", null, "urgent", "ceiling"],
  ["Someone kicked the door in while we were out.", null, "urgent", "security"],
  ["Not sure if it's a gas leak but there's a smell of gas.", "gas", "urgent", "gas"],
  ["Gas bottle hissing by the barbecue.", "gas", "urgent", "gas"],
  ["No power in the whole house, the switchboard has tripped.", "electrician", "urgent", "electric"],
  ["Mould around the bedroom window frame.", "damp", "routine"],
  ["Exhaust fan in the bathroom stopped working.", "electrician", "routine"],
  // G4 round 3 (AI Quality Lead N-23 to N-34): weak words never raise an emergency on their own.
  ["Boiler pilot light. The pilot flame on the boiler keeps going out, so the heating goes off now and then.", "hvac", "routine"],
  ["Cooktop flame. The gas cooktop flame is yellow and orange instead of blue.", "gas", "routine"],
  ["Smoke from next door. The neighbour keeps smoking on his balcony and it drifts into our unit through the window.", null, "routine"],
  ["Flood light. The flood light above the garage has stopped working.", "electrician", "routine"],
  ["Bathroom door. The bathroom door won't lock, the latch is loose.", null, "routine"],
  ["Letterbox. The letterbox has a broken lock.", "locksmith", "routine"],
  ["Drain smell. There is a faint sewage smell from the outside drain.", "plumber", "routine"],
  ["Oven. Gas oven flame keeps going out after a few seconds.", "gas", "routine"],
  ["Smoke alarm. The smoke alarm is going off and there is smoke coming from the oven.", null, "urgent", "fire"],
  ["Socket. No power to one power point in the lounge, everything else works.", "electrician", "routine"],
  ["Bathroom light. The bathroom light stopped working. No water anywhere near it.", "electrician", "routine"],
  ["Static. I got a static shock from the carpet.", null, "routine"],
  // Strong phrases still raise on their own.
  ["The power point in the kitchen is smoking.", "electrician", "urgent", "fire"],
  ["Sewage is coming up through the shower drain.", "plumber", "urgent", "flood"],
  ["The sliding door won't lock and we're going away tomorrow.", "locksmith", "urgent", "security"],
  // G4 round 4 (AI Quality Lead): E = everyday reports that must not raise on their own; S = real emergencies the
  // life-safety tier must still catch with no AI at all.
  ["Aircon. The split system gives a burst of cold air then stops.", null, "routine", undefined, "ai"], // E-01
  ["Patio door. The patio door won't close smoothly, it sticks at the bottom but it does lock.", null, "routine", undefined, "ai"], // E-02
  ["Shower screen. The kids smashed the glass on the shower screen, nobody is hurt and it is taped up.", null, "routine", undefined, "ai"], // E-03
  ["Garage remote. The garage door won't close with the remote, we close it by hand.", null, "routine", undefined, "ai"], // E-04
  ["Smell. There's a burning smell from the neighbour's barbecue most evenings.", null, "routine", undefined, "ai"], // E-05
  ["Heater. The heater smells like burning dust the first time we turn it on each winter.", null, "routine", undefined, "ai"], // E-06
  ["Shed. The power is out in the garden shed, the house is fine.", null, "routine", undefined, "ai"], // E-07
  ["Bathroom. Water everywhere on the bathroom floor after every shower because the screen seal has gone.", null, "routine", undefined, "ai"], // E-08
  ["Toast. Burnt toast set off the smoke alarm again, can it be moved away from the kitchen door?", null, "routine", undefined, "ai"], // E-09
  ["Cat flap. The cat flap won't lock any more.", null, "routine", undefined, "ai"], // E-10
  ["Candle. Soot marks above where we light candles, can the wall be repainted?", null, "routine", undefined, "ai"], // E-11
  ["Downpipe. The downpipe is gushing onto the path when it rains.", null, "routine", undefined, "ai"], // E-12
  ["Fan. There's smoke in the bedroom coming from the ceiling fan.", null, "urgent", "fire"], // S-01
  ["Front door. The lock on the front door is broken and it won't lock.", null, "urgent", "security"], // S-02
  ["Kitchen light. Water is coming out of the kitchen light fitting.", null, "urgent", "electricWater"], // S-03
  ["Wires. There are wires hanging out of the wall where the power point fell off.", null, "urgent", "electric"], // S-04
  ["Dryer. The dryer caught fire, we put it out but the laundry is black.", null, "urgent", "fire"], // S-05
  ["Gas. Strong smell of gas in the hallway near the meter.", null, "urgent", "gas"], // S-06
  ["Toilet. Sewage is overflowing from the toilet onto the floor.", null, "urgent", "flood"], // S-07
  ["Break in. Someone broke in through the back window last night.", null, "urgent", "security"], // S-08
  ["Power point. Smoke is pouring out of the power point in the kitchen.", null, "urgent", "fire"], // S-09
  ["Socket. The plug socket in the lounge is sparking.", null, "urgent", "electric"], // S-10
  ["Ceiling. Water is pouring through the ceiling onto the bed.", null, "urgent", "flood"], // S-11
  ["Switchboard. The switchboard is smoking and smells of burning plastic.", null, "urgent", "fire"], // S-12
  ["Sliding door. The balcony sliding door won't lock, someone tried to force it.", null, "urgent", "security"], // S-13
  ["Alarm. CO alarm keeps going off in the kitchen.", null, "urgent", "co"], // S-14
  ["Shock. I got an electric shock from the oven door.", null, "urgent", "electric"], // S-15
  ["Kitchen. Flames came out of the back of the cooker when I turned it on.", null, "urgent", "fire"], // S-16
  // G4 round 5 (AI Quality Lead): round-4 probes reworded. E = everyday, judged with the AI saying routine; S = real
  // emergencies the rules alone must catch.
  ["Wardrobe. The wardrobe sliding door won't close, it has come off its track.", null, "routine", undefined, "ai"], // E-13
  ["Cooktop. The igniter on the gas cooktop sparks but the burner won't light.", null, "routine", undefined, "ai"], // E-14
  ["Garden tap. Water is dripping from the outside tap near the garden lights.", null, "routine", undefined, "ai"], // E-15
  ["Chimney. Smoke is coming from the neighbour's chimney into our bedroom window.", null, "routine", undefined, "ai"], // E-16
  ["Oven. The oven smells like burnt food every time we use it, I think it needs a deep clean.", null, "routine", undefined, "ai"], // E-17
  ["Backyard. The backyard is flooded after heavy rain because the lawn drains slowly.", null, "routine", undefined, "ai"], // E-18
  ["Bath. The bathroom floor gets flooded when the kids splash in the bath.", null, "routine", undefined, "ai"], // E-19
  ["Gutter. Water is pouring from the gutter over the front door when it rains.", null, "routine", undefined, "ai"], // E-20
  ["Downpipe. Water is gushing out of the downpipe onto the driveway in heavy rain.", null, "routine", undefined, "ai"], // E-21
  ["Shed. We're locked out of the garden shed, the padlock key snapped.", null, "routine", undefined, "ai"], // E-22
  ["Garage. There is no power to the whole garage, the house is fine.", null, "routine", undefined, "ai"], // E-23
  ["Outage. Power is out across the whole street, Ausgrid says it's a planned outage until 3pm.", null, "routine", undefined, "ai"], // E-24
  ["Front door. The front door won't shut quietly, it slams in the wind but it locks fine.", null, "routine", undefined, "ai"], // E-25
  ["Ensuite. The ensuite tap is dripping and keeps the light sleeper in the next room awake.", null, "routine", undefined, "ai"], // E-26
  ["Kitchen. The kitchen reeks of gas.", null, "urgent", "gas"], // S-17
  ["Cooktop. Gas is leaking from the cooktop connection, we can hear it hiss.", null, "urgent", "gas"], // S-18
  ["Alarm. Our CO monitor is beeping and my daughter feels dizzy.", null, "urgent", "co"], // S-19
  ["Hallway. The hallway is filling with smoke and the smoke alarm is going off.", null, "urgent", "fire"], // S-20
  ["Kitchen. There's a fire in the kitchen, the extractor hood is alight.", null, "urgent", "fire"], // S-21
  ["Switchboard. Rain is getting into the switchboard and it's wet inside.", null, "urgent", "electricWater"], // S-22
  ["Lounge. The plasterboard ceiling in the lounge has dropped about 5cm and is cracking.", null, "urgent", "ceiling"], // S-23
  ["Pipe. A pipe has split under the stairs and water is spraying out.", null, "urgent", "flood"], // S-24
  ["Front door. Our front door was jemmied open last night and the lock is wrecked.", null, "urgent", "security"], // S-25
  ["Power point. The power point behind the fridge has melted and is scorched black.", null, "urgent", "fire"], // S-26
  ["Shower. We get a tingle when we touch the shower tap.", null, "urgent", "electric"], // S-27
  ["Laundry. The washing machine hose came off and the laundry is under water.", null, "urgent", "flood"], // S-28
  // G4 round 6 (AI Quality Lead): core phrases narrowed. Even with no AI, these everyday reports must not raise.
  ["Boiler. The pilot light on the boiler won't stay alight.", "hvac", "routine"],
  ["CO alarm. Can you fit a CO alarm in the lounge?", null, "routine"],
  ["Meter. The gas leak at the meter was fixed last week, just letting you know the cover is loose.", null, "routine"],
  ["Toaster. There is smoke from the toaster every morning, it burns everything.", null, "routine"],
  // ...while the real thing still does.
  ["Alarm. The CO alarm is going off and we feel sick.", "gas", "urgent", "co"],
  ["Hood. The extractor hood is alight.", null, "urgent", "fire"],
  // QA round 6: a ceiling fitting is not the ceiling.
  ["Light. The ceiling light cover has fallen off.", "electrician", "routine"],
  ["Paint. The ceiling paint is bulging a little in the corner.", null, "routine"],
];

let fail = 0;
// Two ways to read a case. Default (rules only, the AI unavailable): core and check phrases raise. "ai" cases are
// everyday reports judged with the AI saying routine: only core phrases may override it, so they must find none.
for (const [text, trade, urgency, hazard, mode] of cases) {
  const r = ruleTriage(text);
  const u = mode === "ai" ? r.urgency : rulesOnlyUrgency(r);
  const found = [...r.hazards, ...(mode === "ai" ? [] : r.check)];
  const ok = (trade === null || r.trade === trade) && u === urgency && (!hazard || found.includes(hazard));
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.trade}/${r.urgency} [${r.hazards.join(",")}]  (want ${trade ?? "any"}/${urgency}${hazard ? " +" + hazard : ""})  ${text.slice(0, 54)}`);
}

// Emergency text: verified numbers only, per region.
const au = emergencyText("AU", ["gas", "co"]).join(" ");
const uk = emergencyText("UK", ["gas", "co"]).join(" ");
const checks = [
  [au.includes("131 909") && au.includes("000"), "AU gas text names Jemena 131 909 and 000"],
  [uk.includes("0800 111 999") && uk.includes("NHS 111") && uk.includes("999"), "UK gas/CO text names the National Gas Emergency Service, NHS 111 and 999"],
  [!emergencyText("UK", ["electric"]).join(" ").includes("switchboard"), "UK electric text says consumer unit, not switchboard"],
  [!/—/.test(au + uk), "no em dashes in emergency text"],
];
// UK: hot water comes from the boiler, a Gas Safe heating engineer's job.
const ukHot = ruleTriage("No hot water. The taps only run cold this morning.", "UK");
checks.push([ukHot.trade === "hvac" && ukHot.urgency === "urgent", `UK no hot water goes to the heating engineer, urgent (got ${ukHot.trade}/${ukHot.urgency})`]);
checks.push([isSmokeAlarm("Smoke alarm beeping in the hallway") && !isSmokeAlarm("CO alarm going off"), "smoke alarm faults are recognised, carbon monoxide alarms are not"]);
const auSec = emergencyText("AU", ["security"]).join(" ");
const ukSec = emergencyText("UK", ["security"]).join(" ");
checks.push([auSec.includes("131 444") && auSec.includes("000") && ukSec.includes("101") && ukSec.includes("999"), "break-in text names the police: AU 000 and 131 444, UK 999 and 101"]);
checks.push([emergencyText("UK", ["gas"]).join(" ").includes("call 999"), "UK gas text also names 999"]);
checks.push([/only if they and you are dry/.test(emergencyText("AU", ["flood"]).join(" ")), "flood text: move belongings only if dry"]);
for (const [ok, msg] of checks) {
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);
}
console.log(fail ? `${fail} failing` : "all pass");
process.exit(fail ? 1 : 0);
