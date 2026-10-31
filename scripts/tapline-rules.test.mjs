// Run: node --experimental-strip-types scripts/tapline-rules.test.mjs
// Checks the keyword safety net on realistic tenant reports.
import { ruleTriage } from "../src/lib/tapline/rules.ts";

const cases = [
  ["Water coming through the ceiling. Brown stain and it is dripping into a bucket.", "plumber", "urgent"],
  ["Kitchen tap dripping. The mixer tap drips constantly.", "plumber", "routine"],
  ["Toilet keeps running. Cistern refills every few minutes.", "plumber", "routine"],
  ["No hot water. Hot water system stopped, only cold.", "plumber", "urgent"],
  ["Power point sparking. Sparked when I plugged in a lamp, smells burnt.", "electrician", "urgent"],
  ["Bathroom light not working. Changed the globe but still off.", "electrician", "routine"],
  ["Front door will not lock. Deadbolt jammed, we cannot lock the house.", "locksmith", "urgent"],
  ["Wardrobe door off its track.", "handyman", "routine"],
  ["Gutter overflowing. Back gutter overflows when it rains, water runs down the wall.", "roofer", "routine"],
  ["Air con not cooling. Split system blows warm air.", "hvac", "routine"],
  ["Mice in the kitchen. Droppings in the pantry.", "pest", "routine"],
  ["Cracked window pane in the bedroom.", "glazier", "routine"],
  ["Ceiling fan wobbling in the lounge.", "electrician", "routine"],
  ["I can smell gas near the cooktop.", null, "urgent"],
  ["Boiler stopped, no heating and it is freezing.", "hvac", "urgent"],
  ["Toilet is overflowing onto the bathroom floor.", "plumber", "urgent"],
  ["My laptop charger stopped working in the study.", "handyman", "routine"],
  ["The light switch in the hallway sparks.", "electrician", "urgent"],
  ["Smoke alarm keeps beeping, I think it needs a battery.", null, "routine"],
];

let fail = 0;
for (const [text, trade, urgency] of cases) {
  const r = ruleTriage(text);
  const ok = (trade === null || r.trade === trade) && r.urgency === urgency;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.trade}/${r.urgency}  (want ${trade ?? "any"}/${urgency})  ${text.slice(0, 50)}`);
}
console.log(fail ? `${fail} failing` : "all pass");
process.exit(fail ? 1 : 0);
