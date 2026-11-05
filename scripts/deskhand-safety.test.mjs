// Run: node --experimental-strip-types scripts/deskhand-safety.test.mjs
// The danger line against a corpus written by someone who could not see its code (deskhand-safety-corpus.json). The last 30% of each
// list is held out: this script prints the misses for the tuning part only, and just the count for the held-out part, so the patterns
// can't be fitted to the very cases that are meant to test them. No model and no API key. Bar: danger recall 100%, lookalike false fire 5% or less.
import { readFileSync } from "node:fs";
import { isChemicalQuestion, isDanger } from "../src/lib/deskhand/safety.ts";

const corpus = JSON.parse(readFileSync(new URL("./deskhand-safety-corpus.json", import.meta.url), "utf8"));
const split = (list) => {
  const at = Math.ceil(list.length * 0.7);
  return [list.slice(0, at), list.slice(at)];
};
const fires = (s) => isDanger(s);
const report = (name, list, wrong, show) => {
  const bad = list.filter(wrong);
  console.log(`${name}: ${list.length - bad.length}/${list.length} right`);
  if (show) for (const s of bad) console.log(`   ${s}`);
  return bad.length;
};
const [dTune, dHeld] = split(corpus.danger);
const [lTune, lHeld] = split(corpus.lookalike);
const [cTune, cHeld] = split(corpus.chemicalQuestion);
const noQuestionPath = (s) => !isChemicalQuestion(s) || isDanger(s);
const misses = report("danger, tuning", dTune, (s) => !fires(s), true) + report("danger, HELD OUT", dHeld, (s) => !fires(s), process.argv.includes("--reveal"));
const falseTune = report("lookalike, tuning", lTune, fires, true);
const falseHeld = report("lookalike, HELD OUT", lHeld, fires, process.argv.includes("--reveal"));
const chem = report("chemical question, tuning", cTune, (s) => noQuestionPath(s), true) + report("chemical question, HELD OUT", cHeld, (s) => noQuestionPath(s), process.argv.includes("--reveal"));
const falseRate = (falseTune + falseHeld) / corpus.lookalike.length;
console.log(`danger misses ${misses}, lookalike false fire ${(falseRate * 100).toFixed(1)}%, chemical question misses ${chem}`);
if (misses > 0 || falseRate > 0.05) process.exitCode = 1;
