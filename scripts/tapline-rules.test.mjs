// Run: node --experimental-strip-types scripts/tapline-rules.test.mjs
// The keyword rules are the fallback when the AI is unavailable and the safety
// net that can only raise urgency. These cases include the G4 review's misses.
import { emergencyText, ruleTriage } from "../src/lib/tapline/rules.ts";

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
for (const [ok, msg] of checks) {
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);
}
console.log(fail ? `${fail} failing` : "all pass");
process.exit(fail ? 1 : 0);
