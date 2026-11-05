// The one source for what Larkfield Home Cleaning does and charges. The prompt, the validators, the reply guard and the
// Rules panel all read this object, and sandbox data can never change it. The business is fictional. Prices sit in the inner
// Sydney range per the G1 practitioner review (deskhand\review\G1-v2\practitioner.md), to within about 10%.

export const BUSINESS = "Larkfield Home Cleaning";
export const OWNER = "Dana";

export type Team = "dana" | "rosa";
export const TEAMS: Record<Team, { label: string; jobs: JobKind[] }> = {
  dana: { label: "Team Dana", jobs: ["regular", "deep", "lease"] },
  rosa: { label: "Team Rosa", jobs: ["regular", "deep"] },
};
export const TRAVEL = 30;

export const AREA = ["Marrickville", "Newtown", "Enmore", "Stanmore", "Petersham", "Lewisham", "Dulwich Hill", "Leichhardt", "Annandale", "Forest Lodge", "Glebe", "Camperdown", "Erskineville", "St Peters", "Sydenham"];

export type JobKind = "regular" | "deep" | "lease";
export const JOB_KIND_LABEL: Record<JobKind, string> = { regular: "Regular clean", deep: "Deep clean", lease: "End of lease clean" };

export const JOBS = {
  "regular-1": { kind: "regular", beds: 1, price: 150, minutes: 60 },
  "regular-2": { kind: "regular", beds: 2, price: 190, minutes: 90 },
  "regular-3": { kind: "regular", beds: 3, price: 250, minutes: 120 },
  "regular-4": { kind: "regular", beds: 4, price: 310, minutes: 150 },
  "deep-1": { kind: "deep", beds: 1, price: 240, minutes: 120 },
  "deep-2": { kind: "deep", beds: 2, price: 290, minutes: 150 },
  "deep-3": { kind: "deep", beds: 3, price: 380, minutes: 210 },
  "lease-1": { kind: "lease", beds: 1, price: 340, minutes: 150 },
  "lease-2": { kind: "lease", beds: 2, price: 420, minutes: 210 },
  "lease-3": { kind: "lease", beds: 3, price: 540, minutes: 300 },
} as const satisfies Record<string, { kind: JobKind; beds: number; price: number; minutes: number }>;
export type JobKey = keyof typeof JOBS;
export const JOB_KEYS = Object.keys(JOBS) as JobKey[];

export const ADD_ONS = {
  oven: { price: 60, minutes: 30 },
  fridge: { price: 40, minutes: 15 },
  bathroom: { price: 40, minutes: 15 },
};

export const FEES = {
  moveFree: 24 * 60,
  moveFee: 50,
  leaseFree: 48 * 60,
  leaseFee: 150,
};

// The demo has no real dates, so nothing goes stale: a pinned Tuesday morning and day names. Minutes run from Monday 00:00.
export const DAYS = {
  mon: { index: 0, label: "Monday" },
  tue: { index: 1, label: "Tuesday" },
  wed: { index: 2, label: "Wednesday" },
  thu: { index: 3, label: "Thursday" },
  fri: { index: 4, label: "Friday" },
  sat: { index: 5, label: "Saturday" },
  "next-mon": { index: 7, label: "next Monday" },
  "next-tue": { index: 8, label: "next Tuesday" },
  "next-wed": { index: 9, label: "next Wednesday" },
  "next-thu": { index: 10, label: "next Thursday" },
  "next-fri": { index: 11, label: "next Friday" },
} as const;
export type DayKey = keyof typeof DAYS;
export const BOOKABLE_DAYS: DayKey[] = ["wed", "thu", "fri", "sat", "next-mon", "next-tue", "next-wed", "next-thu", "next-fri"];
export const NOW = 1 * 1440 + 9 * 60 + 40;
export const CLOCK_LABEL = "Tuesday 9:40 am";

export const WINDOWS = [
  { start: 8 * 60, label: "8 am and 9 am" },
  { start: 11 * 60, label: "11 am and 12 pm" },
  { start: 13 * 60, label: "1 pm and 2 pm" },
];
export const closeOf = (day: DayKey) => (day === "sat" ? 12 * 60 : 16 * 60);
export const minuteOf = (day: DayKey, start: number) => DAYS[day].index * 1440 + start;

export const HANDOFF_REASONS = {
  complaint: { label: "Complaint, damage or refund", ends: true },
  person: { label: "Asked for a person", ends: true },
  cancel: { label: "Cancel, skip or stop cleans", ends: false },
  fee: { label: "Asked to waive a fee", ends: false },
  discount: { label: "Discount request", ends: false },
  commercial: { label: "Strata common areas, office, builders or Airbnb", ends: true },
  size: { label: "Too large or unusual to price by text", ends: true },
  funding: { label: "NDIS, aged care or home care funding", ends: true },
  condition: { label: "Hoarding, vermin, needles, black mould or asbestos", ends: true },
  theft: { label: "Theft allegation", ends: true },
  chemicals: { label: "Question about using or mixing chemicals", ends: false },
  lease: { label: "End of lease home not empty, or no power or water", ends: true },
  question: { label: "A question with no approved answer", ends: false },
} as const;
export type HandoffReason = keyof typeof HANDOFF_REASONS;
export const HANDOFF_KEYS = Object.keys(HANDOFF_REASONS) as HandoffReason[];

export const FIRST_TEXT = `Hi, it's the booking assistant at ${BUSINESS}. Sorry we missed your call, ${OWNER}'s on a job. I can sort a price and booking here if you like.`;
export const HANDOFF_PROMISE = `${OWNER}'s on a job. She'll text you back by 5 pm today.`;

/** What the Rules panel shows and the prompt is built from. */
export const RULES = {
  alone: [
    "Answer from the approved facts",
    "Quote a listed price",
    "Create and update the CRM contact",
    "Check the calendar and offer open windows",
    "Book a visit the customer agreed to",
    "Move a booking once the mobile number matches",
  ],
  asks: Object.values(HANDOFF_REASONS).map((r) => r.label),
};

export const FACTS = `PRICES include GST and assume a home in normal condition, 1 bathroom for 1 and 2-bed, 2 bathrooms for 3 and 4-bed. Studio is priced as 1-bed.
Regular clean: 1-bed $150, 2-bed $190, 3-bed $250, 4-bed $310.
Deep clean: 1-bed $240, 2-bed $290, 3-bed $380. 4-bed goes to ${OWNER}.
End of lease clean: 1-bed $340, 2-bed $420, 3-bed $540. 4-bed goes to ${OWNER}.
Extra bathroom $40. Oven $60 on regular and deep. Inside fridge $40.
Regular means weekly or fortnightly with an existing customer. A new customer's first visit, a one-off or a monthly clean is charged as a deep clean. Say: "First clean is a deep clean so we can get on top of everything: $380. After that it's $250 a fortnight."
Word meanings: bond, vacate, move-out and exit clean mean end of lease. Spring, once-off and one-off mean deep. Unit, flat and apartment are the same.
HOURS Mon to Fri 8 am to 4 pm, Sat 8 am to 12 pm. Earliest booking is the next working day. Visits are arrival windows, never exact times.
AREA ${AREA.join(", ")}. Anywhere else: "Sorry, we don't get out to [suburb]."
INCLUDED Regular: kitchen benches, cooktop, outside of appliances, bathrooms, dusting, vacuum and mop, bins, beds if linen is left out. Deep adds skirting, doors and frames, switches, fans and vents, inside the microwave, shower grout and glass, under light furniture. End of lease: oven, rangehood, inside cupboards and drawers, inside windows and tracks, skirting, switches, spot-clean of walls, vacuum and mop.
NOT DONE outside windows, above a two-step ladder, heavy furniture, rubbish removal, washing and ironing, wall washing, carpet steam cleaning, pest treatment.
SUPPLIES all products and equipment supplied. They can leave their own products out if they prefer.
PAYMENT invoice by text after the clean, card or bank transfer, due within 24 hours, no deposit.
STAFF own employed staff, police checked, public liability insured. Same team where possible, not promised.
PARKING paid parking is added at cost. STAIRS free up to 2 levels. PETS fine, dogs shut away or out while we work.
BOND "If your agent lists something we missed, tell us within 7 days of the inspection and we'll come back and fix those items free. Getting the bond back is up to your agent or landlord, so we can't promise that."
MOVING free up to 24 hours before, then $50. End of lease free up to 48 hours before, then $150.
ACCESS customer home, or keys in a lockbox. ${OWNER} confirms the address and any lockbox code by phone the afternoon before. Never ask for an address or a code.`;

export const INTAKE = `Ask one or two at a time and skip what you know: first name; suburb; bedrooms and bathrooms, house or unit; stairs or a lift; when it was last cleaned properly; pets home on the day; where the team can park (permit or timed zones: can they leave a visitor permit); home or lockbox. End of lease also: is it empty with power and water on; when is the final inspection (book at least a day before).`;

export const HANDOFF_RULES = `Use hand_off for: a complaint, damage or refund for our work; asking for a person; cancelling, skipping or stopping cleans; waiving a fee; a discount they agree to pass on (decline first, then offer to pass it on); strata common areas, offices, builders or post-renovation cleans, Airbnb turnover; 4-bed deep or end of lease, extra living areas, more than 2 levels; NDIS, aged care or home care funding; hoarding, squalor, vermin, bed bugs, needles, a death in the home, black or spreading mould (mildew on grout is normal), asbestos or renovation dust; theft (no comment); heavy pet mess; which chemicals are safe to use or mix; an end of lease home that is not empty or has no power or water.
A question you have no fact for: use hand_off with reason "question". The booking can carry on.`;
