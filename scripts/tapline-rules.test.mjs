// Run: node --experimental-strip-types scripts/tapline-rules.test.mjs
// The keyword rules are the fallback when the AI is unavailable and the safety
// net that can only raise urgency. These cases include the G4 review's misses.
import { emergencyText, isSmokeAlarm, ruleTriage } from "../src/lib/tapline/rules.ts";

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
];

let fail = 0;
for (const [text, trade, urgency, hazard] of cases) {
  const r = ruleTriage(text);
  const ok = (trade === null || r.trade === trade) && r.urgency === urgency && (!hazard || r.hazards.includes(hazard));
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
