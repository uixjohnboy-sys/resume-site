import type { Metadata } from "next";
import HomeBody from "@/components/home/HomeBody";
import SkillFlow, { type FlowCard } from "@/components/home/SkillFlow";
import { work } from "@/lib/work";

// One card per kind of work, art made for each (scripts/home-cards, black and white). Each card carries what the old
// work index row carried: the promise, the strongest real proof with its label, and the link to /work/<slug>.
const flowCards: FlowCard[] = work.map((w) => ({
  n: w.n,
  slug: w.slug,
  title: w.title,
  promise: w.promise,
  art: `/home/cards/${w.slug}.webp`,
  tag: [w.lead.kind, w.lead.name, w.lead.when].filter(Boolean).join(" · "),
  line: w.lead.line,
}));

export const metadata: Metadata = {
  title: { absolute: "GoHighLevel Specialist for Hire, GHL Expert | John Boy Roxas" },
  description:
    "HighLevel-certified GoHighLevel specialist in the Philippines, in GHL since 2023. White-label workflows, funnels and snapshots for agencies in Australia and the US.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomeBody hero={<SkillFlow cards={flowCards} />} />;
}
