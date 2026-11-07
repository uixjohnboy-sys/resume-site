// Runs before everything else, on the customer's raw words. Neither of these ever calls a model.

// Format characters (zero-width spaces and joiners) are removed first, so "sme​ll g​as" reads as it looks (G4 Security, m7).
export const stripFormat = (s: string) => s.replace(/\p{Cf}/gu, "");
const norm = (s: string) => stripFormat(s).toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ");

// Fires on present danger, not bare words: "gas oven", "fireplace", "smoke alarm" and "I hurt my back" are ordinary cleaning talk here.
// This is the first layer and it runs with no model at all. It cannot catch every way of saying it, so the agent has a second route:
// flag_danger, which can only raise to this same fixed line. A blind corpus measures both (scripts/deskhand-safety.test.mjs).
const CHEM = "bleach|ammonia|chlorine|domestos|drain cleaner|oven cleaner|toilet cleaner|floor cleaner|mould spray|cleaning (stuff|spray|products?|chemicals?)|chemicals?|detergent|descaler|tile stripper|stripper|vapou?rs?|dishwasher (tablets?|pods?)|rat bait|snail bait|eucalyptus oil|turps|acid|caustic|fumes?";
const SYMPTOM = "dizzy|faint\\w*|pass(ing)? out|frothing|twitching|wheez\\w*|cough\\w*|choking|breath\\w*|burns?|burning|blister\\w*|foaming|drows\\w*|sleepy|gone pale|vomit\\w*|throw\\w* up|sting\\w*|eyes (are )?(streaming|watering|red)|can't see|lips?|throat|screaming|wobbly|overcome|rash|swollen";
const DANGER: RegExp[] = [
  /\bgas\b.{0,45}\b(smell\w*|stink\w*|reek\w*|whiff|leak\w*|hiss\w*|pouring|on for ages|escap\w*)\b/,
  /\b(smell\w*|stink\w*|reek\w*|whiff)\b.{0,30}\bgas\b/,
  /\brotten eggs?\b|\bhissing\b/,
  /\b(is|are|it's|its|caught|on) fire\b(?! (alarm|place|pit|door|blanket))|\bin flames\b|\bflames\b|\b(caught|catching) alight\b|\b(is|it's|went|gone) up in smoke\b|\bablaze\b/,
  /\bfire\b.{0,40}\b(spread\w*|out of control|getting (close|bigger))\b/,
  /\bsmoke('s| is| it's)? (coming|everywhere|pouring|filling|billowing)\b|\bfull of smoke\b|\bsee smoke\b|\bsparking\b.{0,30}\bsmok\w*\b|\bsmoking\b.{0,30}\b(thick|room|power ?point|plug|oven|toaster)\b/,
  // Electrical: sparks with burning or smoke, or a burning smell from a power point or wiring (G4 AI Quality, M5).
  /\bsparks?\b.{0,40}\b(burning|smok\w*|smell\w*)\b|\bburning (plastic|rubber|wires?|smell (from|coming from|out of) (the )?(power ?point|plug|wall|switch|wiring|outlet))\b/,
  // A body in trouble right now, in everyday words.
  /\b(heart attack|having a stroke|seizure|having a fit|not responding|unresponsive|turning blue|blue lips|frothing|foaming at the mouth)\b/,
  /\b(can't|cant|cannot|can not|struggling to) (catch|get) (my|his|her|their|a) breath\b/,
  /\bblood (everywhere|all over|on the (floor|tiles))\b|\bbleeding\b(?! (colou?rs?|dye|ink))/,
  /\b(toxic |chemical |strong )?fumes\b/,
  new RegExp("\\b(" + CHEM + ")\\b.{0,120}\\b(" + SYMPTOM + ")\\b"),
  new RegExp("\\b(" + SYMPTOM + ")\\b.{0,120}\\b(" + CHEM + ")\\b"),
  new RegExp("\\b(swallow\\w*|drank|drunk|ingest\\w*|mouthful|chew\\w*|got into|(?<!\\b(we|i|you|they) )had some|ate)\\b.{0,60}\\b(" + CHEM + "|spray|poison|product|cleaner|oil)\\b"),
  // Not "had some": "we had some tablets left" is not an emergency, "the toddler got into the dishwasher tablets" is.
  /\b(swallow\w*|drank|drunk|ingest\w*|got into|ate|eaten)\b.{0,60}\b(dishwashing liquid|washing liquid|liquid|tablets?|pods?|capsules?)\b/,
  /\b(can't|cant|cannot|can not|can hardly|struggling to|trouble) (get a )?breath(e|ing)?\b/,
  /\bpoison(ed|ing)\b/,
  /\b(unconscious|passed out|not breathing|stopped breathing|collapsed|won't wake|bleeding (badly|a lot))\b/,
  /\b(someone|somebody|he|she|they|my (\w+ )?(mum|dad|son|daughter|wife|husband|partner|kid|child|baby|cleaner|neighbour)) (is|are|was|got|has been|'s|been) (badly |really |seriously )?(hurt|injured|burnt|burned|electrocuted)\b/,
  /\bi('m| am| got| have been|'ve been) (badly |really |seriously )(hurt|injured|burnt|burned)\b/,
  /\b(in danger|not safe right now|call(ing)? (an )?ambulance|need (an )?ambulance|call 000|calling 000)\b/,
];

// A hazard that is over, or a device that is merely being mentioned, is not an emergency unless they say it is happening now.
const OVER = /\b(last (week|month|year|time)|yesterday|years? ago|months? ago|a while ago|was fine|all good now|been fixed|got fixed|fixed it|had .{0,20}fixed)\b/;
const NOW = /\b(right now|still|now|just|getting worse)\b/;
const NOT_DANGER: RegExp[] = [/\bsmoke alarm\b(?!.*\b(fire|burning)\b)/];

export function isDanger(raw: string): boolean {
  const t = norm(raw);
  if (!DANGER.some((r) => r.test(t))) return false;
  if (OVER.test(t) && !NOW.test(t.replace(/\ball good now\b/, ""))) return false;
  if (NOT_DANGER.some((r) => r.test(t)) && !DANGER.slice(0, 3).some((r) => r.test(t))) return false;
  return true;
}

// Asking about mixing products is not an emergency: it needs one fixed, true sentence and Dana, not a call to 000.
const SYMPTOMS = /\b(fumes?|cough\w*|breath\w*|dizzy|sick|burn\w*|sting\w*|swallow\w*|unconscious|hurt|fainted)\b/;
const PRODUCT = "bleach|ammonia|domestos|exit mould|mould spray|napisan|ajax|clr|drain cleaner|oven cleaner|floor cleaner|vinegar|spray n wipe|chemicals?|cleaning products?|products?";
export function isChemicalQuestion(raw: string): boolean {
  const t = norm(raw);
  if (SYMPTOMS.test(t)) return false;
  // Which product is safe on what, or with what: not something this agent answers.
  if (new RegExp(`\\b(can|could|is|are|should|do i|safe)\\b.{0,50}\\b(${PRODUCT})\\b.{0,50}\\b(with|and|after|together|same|on|off|ok|okay|safe|follow)\\b`).test(t) && !/\b(you|your|do you|you guys)\b/.test(t)) return true;
  return /\b(can|could|should|is it|safe|ok|okay|thinking|going|gonna|want|what happens|how)\b.{0,40}\b(mix|mixing|combine|combining)\b/.test(t) || /\b(mix|mixing|combine|combining)\b.{0,50}\b(ok|okay|safe)\b/.test(t);
}
export const CHEMICAL_TEXT = "Please don't mix cleaning products. Some combinations make a toxic gas. Leave it for now.";

export const DANGER_TEXT = "This is a demo and nobody has been contacted. If there is any danger, call 000 or your local emergency number now.";

// ---------- personal data ----------

const luhn = (d: string) => {
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
};

// Australian street types as people text them, including the ones with no abbreviation (G4 Security, M1).
const STREET = "st|street|rd|road|ave|avenue|av|lane|ln|dr|drive|cres|crescent|cr|pl|place|tce|terrace|pde|parade|hwy|highway|way|ct|crt|court|cl|close|blvd|boulevard|boulevarde|bvd|gr|grove|cct|circuit|esp|esplanade|mews|row|sq|square|walk|loop|rise|grn|green|pkwy|parkway|track|trail|alley|link|glade|gardens|gdns|retreat|vista|ridge|chase|quay";
const CODE_WORD = "code|pin|passcode|password|alarm|lockbox|lock box|key safe|keysafe|key box|gate|intercom|fob|keypad|key pad|combo|combination|padlock|garage remote|garage door|door code";
const SPELLED = "zero|oh|one|two|three|four|five|six|seven|eight|nine";

export type Masked = { text: string; hit: boolean; hitAccess: boolean };

/**
 * Before any model call or save: emails, card numbers, phones outside the reserved fiction range, access codes and street
 * addresses become tokens. Reserved fiction numbers (0491 57x xxx) pass, so a visitor's made-up identity still works.
 */
export function maskPersonal(raw: string): Masked {
  let hit = false;
  let hitAccess = false;
  let text = stripFormat(raw);
  // "sam@x.com", "sam @ x . com" and "sam at x dot com".
  text = text.replace(/[^\s@]+\s*@\s*[^\s@]+(\s*\.\s*[a-z]{2,})+|\b[\w.+-]+\s+at\s+[\w-]+(\s+dot\s+[a-z]{2,})+\b/gi, () => {
    hit = true;
    return "[email removed]";
  });
  // Four or more digits spelled out ("four four seven one") is a code read aloud.
  text = text.replace(new RegExp(`\\b(?:(?:${SPELLED})[\\s,-]+){3,}(?:${SPELLED})\\b`, "gi"), () => {
    hit = hitAccess = true;
    return "[code removed]";
  });
  // Codes first: "code 4471" must not read as anything else.
  text = text.replace(new RegExp(`\\b(${CODE_WORD})\\b[^\\d\\n]{0,20}(\\d[\\d\\s#*-]{1,10}\\d|\\d{3,8})`, "gi"), (_m, word) => {
    hit = hitAccess = true;
    return `${word} [code removed]`;
  });
  text = text.replace(new RegExp(`(\\d{3,8})[^\\d\\n]{0,20}\\b(${CODE_WORD})\\b`, "gi"), (_m, _d, word) => {
    hit = hitAccess = true;
    return `[code removed] ${word}`;
  });
  text = text.replace(new RegExp(`\\b(unit |apt |flat )?\\d{1,5}[a-z]?(\\/\\d{1,5}[a-z]?)?\\s+([a-z'-]+\\s+){1,3}(${STREET})\\b\\.?`, "gi"), () => {
    hit = hitAccess = true;
    return "[address removed]";
  });
  // A card can come with any separator ("4111/1111/1111/1111"). A slash never makes a phone number, so dates stay as they are.
  text = text.replace(/(?<![\d])(\+?\d[\d\s()./_-]{7,24}\d)(?![\d])/g, (m) => {
    const d = m.replace(/\D/g, "");
    if (/^0491\s?57/.test(d) && d.length === 10) return m;
    if (d.length >= 13 && d.length <= 19 && luhn(d)) {
      hit = true;
      return "[card removed]";
    }
    if (/[/_]/.test(m)) return m;
    if (d.length >= 8 && d.length <= 13) {
      hit = true;
      return `04xx xxx ${d.slice(-3)}`;
    }
    return m;
  });
  return { text, hit, hitAccess };
}

export const MASK_TEXT = "Please don't text codes or your address. We send a secure link for those after booking. If that was a real code, it's worth changing.";
