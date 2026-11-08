// Run: node --experimental-strip-types scripts/deskhand-safety.test.mjs
// The danger line against a corpus written by someone who could not see its code (deskhand-safety-corpus.json). The last 30% of each
// list is held out: this script prints the misses for the tuning part only, and just the count for the held-out part, so the patterns
// can't be fitted to the very cases that are meant to test them. No model and no API key. Bar: danger recall 100%, lookalike false fire 5% or less.
import { readFileSync } from "node:fs";
import { isChemicalQuestion, isDanger, isDangerSign } from "../src/lib/deskhand/safety.ts";
// Two tiers since G4 (AI Quality recheck 3). "fires" is the net as a whole: a strong match sends the fixed line at once; a sign is put
// to the model, and with no model it sends the fixed line, so on the no-model path both tiers are the danger line. "strong" is the
// part that fires whatever the model says, and its lookalike rate is the one that reaches a customer with the AI working.

const corpus = JSON.parse(readFileSync(new URL("./deskhand-safety-corpus.json", import.meta.url), "utf8"));
const split = (list) => {
  const at = Math.ceil(list.length * 0.7);
  return [list.slice(0, at), list.slice(at)];
};
const fires = (s) => isDanger(s) || isDangerSign(s);
const strong = (s) => isDanger(s);
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
const strongFalse = corpus.lookalike.filter(strong).length / corpus.lookalike.length;
const strongHits = corpus.danger.filter(strong).length;
console.log(`danger misses ${misses} (no-model path), lookalike false fire ${(falseRate * 100).toFixed(1)}% (no-model path), ${(strongFalse * 100).toFixed(1)}% (strong tier, AI on), strong tier alone catches ${strongHits}/${corpus.danger.length}, chemical question misses ${chem}`);
if (falseRate > 0.05 || strongFalse > 0.05) process.exitCode = 1;
