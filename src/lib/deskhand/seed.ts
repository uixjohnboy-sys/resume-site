import { JOBS, type DayKey, type JobKey, type Team } from "./pack.ts";
import type { Contact, Conversation, Sandbox, Visit } from "./types.ts";

// A real-looking fortnight for a fictional business: mostly repeat customers on the same day and team, with suburbs only and no
// street addresses, so no fictional job lands on a real house. Phones come from ACMA's list of numbers reserved for fiction.

export const CARDS = {
  mia: { name: "Mia", suburb: "Marrickville", phone: "0491 570 156", job: "3-bed, wants a fortnightly clean" },
  tom: { name: "Tom", suburb: "Marrickville", phone: "0491 570 737", mobile: "0491 570 313", job: "Move his Thursday clean. Texting from his work phone; the booking is under his mobile" },
  priya: { name: "Priya", suburb: "Glebe", phone: "0491 570 006", job: "Common areas of her strata building" },
} as const;
export type CardId = keyof typeof CARDS;

const R: [Team, DayKey, number, JobKey, string, string, boolean][] = [
  ["dana", "mon", 480, "regular-2", "Helen", "Newtown", true],
  ["dana", "mon", 660, "regular-3", "Marcus", "Leichhardt", true],
  ["dana", "tue", 480, "lease-2", "Aisha", "Glebe", false],
  ["dana", "tue", 780, "regular-1", "Ben", "Enmore", true],
  ["dana", "wed", 480, "regular-3", "Joan", "Stanmore", true],
  ["dana", "thu", 480, "lease-3", "Carla", "Annandale", false],
  ["dana", "fri", 480, "regular-2", "Sophie", "Petersham", true],
  ["dana", "fri", 660, "deep-2", "Owen", "Marrickville", false],
  ["dana", "sat", 480, "regular-1", "Nina", "Erskineville", true],
  ["rosa", "mon", 480, "regular-3", "Greg", "Dulwich Hill", true],
  ["rosa", "mon", 660, "regular-1", "Lucy", "Lewisham", true],
  ["rosa", "mon", 780, "regular-2", "Amy", "St Peters", true],
  ["rosa", "tue", 480, "regular-4", "Vera", "Annandale", true],
  ["rosa", "tue", 660, "regular-2", "Paul", "Camperdown", true],
  ["rosa", "wed", 480, "regular-2", "Tess", "Sydenham", true],
  ["rosa", "wed", 660, "deep-3", "Ravi", "Newtown", false],
  ["rosa", "thu", 480, "regular-3", "Tom", "Marrickville", true],
  ["rosa", "thu", 660, "regular-1", "Kim", "Forest Lodge", true],
  ["rosa", "thu", 780, "regular-2", "Zoe", "Enmore", true],
  ["rosa", "fri", 480, "deep-1", "Ian", "Glebe", false],
  ["rosa", "fri", 780, "regular-3", "Mei", "Leichhardt", true],
];

export const SEED_NAMES = [...new Set(R.map((r) => r[4]))];

export function freshConversation(): Conversation {
  return {
    card: null,
    contactId: null,
    verifiedContactId: null,
    wrongPhones: 0,
    messages: [],
    offers: [],
    turn: 0,
    feeNotice: null,
    feeConsent: null,
    strikes: 0,
    noToolTurns: 0,
    rulesOnly: false,
    jobDone: false,
    closed: false,
  };
}

export function seedSandbox(): Sandbox {
  const contacts: Contact[] = [];
  const visits: Visit[] = [];
  R.forEach(([team, day, start, jobKey, name, suburb, repeat], i) => {
    const contactId = `c${i + 1}`;
    contacts.push({
      id: contactId,
      firstName: name,
      suburb,
      phone: name === "Tom" ? CARDS.tom.mobile : null,
      bedrooms: JOBS[jobKey].beds,
      access: i % 3 === 0 ? "lockbox" : "home",
      frequency: repeat ? (i % 2 === 0 ? "fortnightly" : "weekly") : null,
      notes: null,
      stage: "Booked",
      existing: true,
    });
    visits.push({
      id: `v${i + 1}`,
      ref: `LH-${1001 + i}`,
      contactId,
      customer: name,
      suburb,
      team,
      day,
      start,
      jobKey,
      minutes: JOBS[jobKey].minutes,
      price: JOBS[jobKey].price,
      repeat,
    });
  });
  return { contacts, visits, handoffs: [], log: [], seq: 0, nextRef: 1001 + R.length, nextOffer: 1, conv: freshConversation() };
}
