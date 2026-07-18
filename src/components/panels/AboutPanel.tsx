"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  IconLayoutGrid,
  IconBrandFigma,
  IconRobot,
  IconBrandGithub,
  IconBrandVercel,
  IconBrandSlack,
  IconBrandZapier,
  IconSitemap,
  IconBrandAdobePhotoshop,
  IconBrandAdobeIllustrator,
  IconBrandAdobePremiere,
  IconMovie,
  IconLayoutKanban,
  IconPlayerPlayFilled,
  IconArrowDown,
  IconX,
  IconStarFilled,
  IconArrowUpRight,
  IconRoute,
  IconCompass,
  IconCommand,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import Card from "@/components/ui/Card";

const clientTestimonials = [
  { name: "Sarah Mitchell", role: "Real Estate Broker", quote: "John completely transformed how we handle leads. What used to take my team hours of manual follow-up now happens automatically, and we're closing deals faster because of it." },
  { name: "Dr. Amir Hassan", role: "Chiropractor", quote: "I was skeptical about automation at first, but John set up a system that actually feels personal to my clients. Our booking rate went up almost immediately." },
  { name: "Rachel Tan", role: "Business Coach", quote: "He didn't just build what I asked for, he asked the right questions first and built what my business actually needed. Huge difference." },
  { name: "Marcus Webb", role: "Roofing Contractor", quote: "Our missed calls used to mean missed revenue. Now every missed call gets a text back within seconds. Simple fix, massive impact." },
  { name: "Liza Fernandez", role: "Real Estate Agent", quote: "Sobrang laking tulong ni John sa GHL setup namin. Dati kami mismo nag-eencode ng leads sa spreadsheet, ngayon automatic na lahat at mas mabilis pa kami maka-follow up." },
  { name: "Priya Nair", role: "Dental Clinic Owner", quote: "The review request automation alone paid for the whole project. We went from a handful of reviews to over 40 in two months." },
  { name: "Devon Clarke", role: "Marketing Agency Owner", quote: "John's the kind of person who tells you when your idea isn't going to work, and then shows you a better one. That honesty is rare." },
  { name: "Tomasz Nowak", role: "Landscaping Business Owner", quote: "I run a small landscaping crew and honestly didn't think I needed anything this advanced. Turns out the automated quote follow-ups alone doubled my close rate." },
  { name: "Ronnie Cabrera", role: "Auto Detailing Shop", quote: "He's incredibly professional, answered every question no matter how basic. Our workflow now runs like it has its own brain, working even while we're asleep." },
  { name: "Helena Brooks", role: "Insurance Agency", quote: "He migrated our entire CRM without us losing a single record. That's rarer than it sounds in this industry." },
  { name: "George Petrakis", role: "Home Renovation Contractor", quote: "What I appreciated most was that he explained everything in plain English. I actually understand my own system now." },
  { name: "Dr. Michelle Ong", role: "Med Spa Owner", quote: "Our appointment no-show rate dropped by more than half after he set up the reminder sequences. That alone was worth it." },
  { name: "Farah Idris", role: "E-commerce Store Owner", quote: "John built us a dashboard that finally lets me see what's actually happening in my business day to day. I used to guess, now I know." },
  { name: "Josie Villaruel", role: "Wedding Planner", quote: "Ang galing niya mag-explain, hindi siya nagmamadali. Kahit ilang beses ko tinanong, sinagot niya lahat ng maayos hanggang naintindihan ko na." },
  { name: "Nathaniel Cross", role: "Fitness Coach", quote: "He built a chatbot that actually sounds like my brand, not a robot reading a script. My clients keep complimenting it." },
  { name: "Belinda Farrow", role: "Financial Coach", quote: "I've worked with three other GHL people before John. He's the only one who actually finished what he started." },
  { name: "Owen Radcliffe", role: "Solar Installation Company", quote: "The lead routing system he built means the right salesperson gets the right lead instantly. No more leads sitting untouched for days." },
  { name: "Carmen Delgado", role: "Legal Services Firm", quote: "He's responsive, honest about timelines, and doesn't disappear once the invoice is paid. That's basically all I wanted." },
  { name: "Edwin Salcedo", role: "Pet Grooming Salon", quote: "I was nervous about automation at first, worried it would kill the personal touch with our clients. But he did it so well, it still feels like a real person talking to them even though it's automated." },
  { name: "Isabelle Renard", role: "Life Coach", quote: "John rebuilt our entire funnel and our cost per lead dropped noticeably within the first month. He knows what he's doing." },
  { name: "Grace Adeyemi", role: "Business Consultant", quote: "The nurture sequences he wrote don't feel salesy at all. My clients actually thank me for the emails, which never happened before." },
  { name: "Trent Kowalski", role: "Salon Owner", quote: "He caught a gap in our booking flow that we didn't even know was costing us clients. Fixed it in a day." },
  { name: "Simone Beaulieu", role: "Career Coach", quote: "I run a one-person coaching business and needed something that could handle admin work I don't have time for. John built exactly that." },
  { name: "Aiden Foster", role: "Auto Repair Shop", quote: "Our SMS follow-ups used to be inconsistent, sometimes forgotten entirely. Now it's automatic and honestly better than when we did it manually." },
  { name: "Renata Alvez", role: "Boutique Owner", quote: "He's patient with people who aren't tech-savvy, which is basically me. Never made me feel dumb for asking questions." },
  { name: "Arnel Buenaventura", role: "Barbershop Chain Owner", quote: "Yung pag-book ng appointments namin ngayon halos hindi na namin ginagalaw, tuloy-tuloy na siya. Malaking bawas sa gastos namin sa manpower." },
  { name: "Douglas Pratt", role: "Franchise Owner", quote: "John built us a system that scales with us. We've added two more locations since and the setup handled it without a hitch." },
  { name: "Whitney Okonkwo", role: "Consulting Firm", quote: "The onboarding automation he built cut our client intake time from a week down to a single day." },
  { name: "Callum Ashworth", role: "Real Estate Investor", quote: "He's upfront about what GHL can and can't do, which I respected. No overselling, just honest guidance." },
  { name: "Lena Vogel", role: "Interior Designer", quote: "My inbox used to be chaos. Now everything routes exactly where it needs to go and I actually get to focus on clients instead of admin." },
  { name: "Marcus Delaney", role: "Fitness Studio Owner", quote: "The Instagram automation he built for us catches leads we would have completely missed before. It just works quietly in the background." },
  { name: "Priscilla Yeung", role: "Med Spa Chain", quote: "He rebuilt our booking calendar integration in a way our old developer said wasn't possible. It's been rock solid since." },
  { name: "Baxter Lindqvist", role: "Landscaping Company", quote: "Straightforward, no fluff, delivers what he says he will. In this industry that's worth more than people realize." },
  { name: "Melinda Ocampo", role: "Online Seller", quote: "He replies fast, even on weekends sometimes. It felt like he genuinely prioritized us even though we're a small business." },
  { name: "Harrison Blake", role: "Roofing Company", quote: "He set up a review funnel that quietly built our reputation while we focused on actually running the business." },
  { name: "Odalys Reyes", role: "Property Management Company", quote: "I didn't realize how much time we were losing to manual data entry until he automated it away. It's been a genuine relief." },
  { name: "Desmond Achebe", role: "Marketing Consultant", quote: "John explained the tradeoffs clearly instead of just building whatever I asked for blindly. That guidance saved us from a few mistakes." },
  { name: "Fiona Halloran", role: "Chiropractic Clinic", quote: "Our follow-up used to depend on whoever remembered to do it. Now it just happens, every time, the same way." },
  { name: "Rutger Voss", role: "Home Services Company", quote: "He's easy to reach and doesn't make you feel like a burden for asking for small tweaks after the project is done." },
  { name: "Anaya Deshpande", role: "Online Course Creator", quote: "The automation he built for our webinar funnel handled a launch that would have overwhelmed my team otherwise." },
  { name: "Ferdinand Aquino", role: "Furniture Business Owner", quote: "Sobrang bait niya makipag-usap, hindi siya technical na technical yung paraan ng pagpaliwanag, kaya kahit hindi ako sanay sa ganitong mga tools naintindihan ko agad." },
  { name: "Cassandra Whitfield", role: "Dental Group", quote: "He set clear expectations from day one and hit every milestone he promised. Rare in this line of work." },
  { name: "Julian Okafor", role: "Insurance Brokerage", quote: "The pipeline he built gives me a real view of where every deal actually stands. No more guessing what's stuck where." },
  { name: "Ingrid Solberg", role: "Wellness Studio", quote: "I appreciated that he pushed back when one of my ideas wouldn't have worked well. Saved me time and money." },
  { name: "Percy Odongo", role: "Coaching Business", quote: "Our client onboarding went from scattered emails to one clean automated sequence. Clients notice the difference immediately." },
  { name: "Vivienne Castellano", role: "Event Planning Company", quote: "He's thorough. Tested everything twice before handing it over, which meant we didn't run into surprises later." },
  { name: "Dashiell Ferro", role: "HVAC Company", quote: "The missed-call text-back alone has probably paid for the entire engagement several times over." },
  { name: "Corazon Villamor", role: "Online Boutique", quote: "Our support team used to be small and messages would get left behind. Now everything gets addressed right away because of the automation he built." },
  { name: "Elias Marchetti", role: "Legal Consultancy", quote: "He built something that actually matches how my business really operates, not a generic template forced onto it." },
  { name: "Naomi Kessler", role: "Photography Studio", quote: "Communication was clear the entire way through. I never had to wonder what stage the project was at." },
  { name: "Oswaldo Bautista", role: "Solar Company", quote: "The lead scoring system he set up means my sales team stops wasting time on leads that were never going to convert." },
  { name: "Adelaide Fenwick", role: "Boutique Fitness Studio", quote: "He genuinely cares about getting it right, not just getting it done. That mindset shows in the final product." },
  { name: "Reginald Okoye", role: "Business Coaching Firm", quote: "Our nurture emails finally sound like they're actually written by us instead of a generic template. Clients have commented on it." },
  { name: "Sylvie Marchand", role: "Spa & Wellness Center", quote: "He was patient walking us through the handover so my team could actually run things ourselves afterward." },
  { name: "Tobias Kingsley", role: "Auto Sales Dealership", quote: "The automation caught a lead source we didn't even know was underperforming. Fixed a problem we didn't know we had." },
  { name: "Marguerite Beaumont", role: "Consulting Practice", quote: "I've referred two other business owners to him already. That should say enough." },
  { name: "Bayani Trinidad", role: "Logistics Company", quote: "Mabilis siyang magtrabaho pero hindi nagmamadali sa quality, tama talaga yung setup namin kahit kumplikado yung hiningi namin." },
  { name: "Constance Ubah", role: "Independent Consultant", quote: "He built exactly what my business needed to stop relying on me for every single follow-up. That's given me my time back." },
];

const clientAvatarPool = [
  ...Array.from({ length: 30 }, (_, i) => `https://randomuser.me/api/portraits/men/${i + 1}.jpg`),
  ...Array.from({ length: 30 }, (_, i) => `https://randomuser.me/api/portraits/women/${i + 1}.jpg`),
];

const AVATAR_SLOTS = 6;

function pickDistinctIndices(count: number, poolSize: number) {
  const picked: number[] = [];
  while (picked.length < count) {
    const candidate = Math.floor(Math.random() * poolSize);
    if (!picked.includes(candidate)) picked.push(candidate);
  }
  return picked;
}

function ClientAvatarGrid() {
  const [indices, setIndices] = useState<number[]>(() => pickDistinctIndices(AVATAR_SLOTS, clientAvatarPool.length));
  const [fading, setFading] = useState<boolean[]>(() => Array(AVATAR_SLOTS).fill(false));

  useEffect(() => {
    const nextChangeAt = Array.from({ length: AVATAR_SLOTS }, () => Date.now() + 2500 + Math.random() * 2500);

    const timer = setInterval(() => {
      const now = Date.now();
      nextChangeAt.forEach((t, i) => {
        if (now < t) return;
        nextChangeAt[i] = now + 2500 + Math.random() * 2500;

        setFading((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });

        setTimeout(() => {
          setIndices((prev) => {
            const used = new Set(prev);
            used.delete(prev[i]);
            let candidate = Math.floor(Math.random() * clientAvatarPool.length);
            let attempts = 0;
            while (used.has(candidate) && attempts < 30) {
              candidate = Math.floor(Math.random() * clientAvatarPool.length);
              attempts++;
            }
            const next = [...prev];
            next[i] = candidate;
            return next;
          });
          setFading((prev) => {
            const next = [...prev];
            next[i] = false;
            return next;
          });
        }, 350);
      });
    }, 300);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-2 grid grid-cols-3 gap-1.5">
      {indices.map((poolIndex, slot) => (
        <img
          key={slot}
          src={clientAvatarPool[poolIndex]}
          alt="Client"
          className="aspect-square w-full rounded-[6px] object-cover transition-opacity duration-[350ms] ease-in-out"
          style={{ opacity: fading[slot] ? 0 : 1 }}
        />
      ))}
    </div>
  );
}

const badges = [
  {
    name: "Funnel Building Expert",
    image: "/badge-funnel-building-expert.png",
    description: "Completed GoHighLevel Champs and certified in building high-converting funnels.",
  },
  {
    name: "Workflow & Automation Expert",
    image: "/badge-workflow-automation-expert.png",
    description: "Certified in building multi-step workflows and automations that run without manual input.",
  },
  {
    name: "Course & Community Creation Expert",
    image: "/badge-course-community-expert.png",
    description: "Certified in building and launching courses and community spaces inside GoHighLevel.",
  },
  {
    name: "AI Employee Specialist",
    image: "/badge-ai-employee-specialist.png",
    description: "Certified in building AI-powered employees and assistants inside GoHighLevel.",
  },
];

const journey = [
  "I started out freelancing in graphic design, then moved into web design and development. After building websites for a while, I got curious about what more I could offer beyond just the design.",
  "That's when I found GoHighLevel. It wasn't as big back then as it is now, but I could tell it was the next generation of business growth tools.",
  "With GoHighLevel, you can build an entire business system: agency setup, client sub-accounts, automated onboarding, powerful workflows and automations, and even reputation management, which is huge for service-based businesses running on a Google Business Profile.",
  "They've since built AI into the platform too, which makes it even more powerful.",
  "That's why I spend most of my time mastering GoHighLevel and staying current with it, so I can help businesses build a full client-generating system, not just a typical website, but a polished backend that lets the frontend actually perform.",
];

const apps = [
  {
    name: "Pathwise",
    description:
      "A dashboard-style workflow mapping app that helps plan a journey from goal to milestone, with visual node maps and hotspots.",
    icon: IconRoute,
  },
  {
    name: "Compass",
    description: "A dashboard for tracking client engagements end to end, from first call to delivered system.",
    icon: IconCompass,
  },
  {
    name: "Command",
    description: "A central place to monitor and manage automations running across client accounts.",
    icon: IconCommand,
  },
];

const automationsTarget = 34;

const automations = [
  {
    name: "Instagram, Keyword: CHAOS",
    description:
      "GoHighLevel workflow that replies to Instagram DMs when a keyword is detected, then routes the contact through a branching follow-up sequence.",
    image: "/automation-instagram-chaos.jpg",
  },
];

function ClickHint() {
  return (
    <div
      className="pointer-events-none absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full"
      style={{ background: "var(--bg-surface-2)", color: "var(--text-muted)" }}
    >
      <IconArrowUpRight size={11} />
    </div>
  );
}

const experience = [
  {
    company: "Jessica Conner Business Consulting",
    role: "GoHighLevel Specialist, Automation (n8n, Zapier, Claude)",
    period: "April 2026 to present · Australian timezone client",
    bullets: [
      "Handling automation for an Australian-timezone client, building workflows on GoHighLevel using n8n, Zapier, and Claude.",
    ],
  },
  {
    company: "Chaos to Closing",
    role: "GoHighLevel Systems Builder",
    period: "March 2026 to present · CST timezone client",
    bullets: [
      "Built the client's entire business inside GoHighLevel from scratch, focused on social media lead capture and nurture through ManyChat.",
    ],
  },
  {
    company: "Wrldinvsn",
    role: "Lead Flow & Funnel Operations Specialist",
    period: "Dec 2025 to Feb 2026 · Project-based",
    bullets: [
      "Built end-to-end lead tracking from click to close so no opportunity is missed.",
      "Designed high-converting landing pages and VSLs optimized for lead capture.",
      "Engineered an automated booking system with calendar sync, reminders, and cancellation handling.",
    ],
  },
  {
    company: "K Australia Design",
    role: "Lead GHL Automation Architect",
    period: "Sept 2024 to Oct 2025",
    bullets: [
      "Engineered scalable GoHighLevel infrastructure so agencies could onboard unlimited clients with zero technical friction.",
      "Built always-on multi-channel nurture automations across SMS, email, and voicemail drop.",
      "Managed A2P 10DLC registration and messaging logic to protect inbox deliverability.",
      "Integrated one-click booking and CRM triggers that turn inquiries into confirmed appointments automatically.",
    ],
  },
  {
    company: "Freelance CRM & Automation Consultant",
    role: "GoHighLevel Expert · Sales Funnels · Web Design",
    period: "Jan 2024 to present · 13+ projects completed",
    bullets: [
      "Built high-performing GHL systems for MedSpas, real estate, coaches, and chiropractors.",
      "Architected multi-channel automation (email, SMS, voicemail drop) to cut manual work and speed up response times.",
      "Specialized in full GHL migrations, snapshot creation, and SaaS mode setup for scaling agencies.",
    ],
  },
  {
    company: "Masterpiece Las Vegas",
    role: "Senior Design & Systems Strategist",
    period: "Feb 2021 to June 2023",
    bullets: [
      "Developed conversion-focused UI/UX strategies that build trust and turn visitors into customers.",
      "Connected lead-capture forms to automated CRM workflows so no lead was lost.",
      "Optimized marketing funnels by pairing visual design with data logic to lower lead costs.",
    ],
  },
];

const tools = [
  {
    name: "Claude",
    icon: IconRobot,
    color: "#DA7756",
    description:
      "My AI pair for building automations, writing code, and thinking through client workflows before anything gets built.",
  },
  {
    name: "n8n",
    icon: IconSitemap,
    color: "#FF6D5A",
    description:
      "For building the automation flows that connect GoHighLevel to everything else a client's business runs on.",
  },
  {
    name: "Zapier",
    icon: IconBrandZapier,
    color: "#FF4A00",
    description:
      "The quick-connect tool I reach for when a client's stack needs two apps talking to each other fast.",
  },
  {
    name: "Figma",
    icon: IconBrandFigma,
    color: "#F24E1E",
    description:
      "For designing funnel pages, landing pages, and UI before they go live in GoHighLevel or on the web.",
  },
  {
    name: "GitHub",
    icon: IconBrandGithub,
    color: "var(--text-primary)",
    description:
      "Where every project lives, gets version controlled, and gets reviewed before it ships anywhere else.",
  },
  {
    name: "Vercel",
    icon: IconBrandVercel,
    color: "var(--text-primary)",
    description:
      "My default host for shipping projects fast, connected straight to GitHub so every push goes live automatically.",
  },
  {
    name: "Photoshop",
    icon: IconBrandAdobePhotoshop,
    color: "#31A8FF",
    description: "For photo editing and graphics, mostly ad creative and social assets for client campaigns.",
  },
  {
    name: "Illustrator",
    icon: IconBrandAdobeIllustrator,
    color: "#FF9A00",
    description: "For logos, icons, and vector graphics that need to stay clean at any size.",
  },
  {
    name: "Adobe Premiere Pro",
    icon: IconBrandAdobePremiere,
    color: "#9999FF",
    description: "For longer-form video editing, mainly VSLs and client campaign videos.",
  },
  {
    name: "CapCut",
    icon: IconMovie,
    color: "var(--text-primary)",
    description: "My go-to for quick social media edits and short-form video content.",
  },
  {
    name: "Slack",
    icon: IconBrandSlack,
    color: "#ECB22E",
    description:
      "Where client and team communication happens day to day, from quick questions to sharing work in progress.",
  },
  {
    name: "ClickUp",
    icon: IconLayoutKanban,
    color: "#7B68EE",
    description: "Where I plan projects, track tasks, and keep every client engagement organized.",
  },
];

function Tag({ label }: { label: string }) {
  return (
    <span
      className="mb-1.5 mr-1.5 inline-block rounded-lg px-2.5 py-1 text-[11px]"
      style={{ background: "var(--bg-card-alt, var(--border-surface))", color: "var(--text-secondary)" }}
    >
      {label}
    </span>
  );
}

function ScrollHint() {
  return (
    <div className="pointer-events-none absolute bottom-3 right-3 flex flex-col items-center gap-1">
      <span
        className="text-[9px] tracking-wider"
        style={{ color: "var(--text-faint)", writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        Scroll down
      </span>
      <IconArrowDown size={11} style={{ color: "var(--text-faint)" }} />
    </div>
  );
}

function BottomFade() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-9 rounded-b-[24px]"
      style={{ background: "linear-gradient(to top, var(--bg-surface), rgba(28,26,23,0))" }}
    />
  );
}

const projects = [
  {
    name: "Chaos to Closing",
    image: "/project-chaos-to-closing.jpg",
    context:
      "The flagship home base for a real estate coaching academy, built to guide agents from a free lead-flow workshop into paid PRO Coaching membership, with tiered pricing, live event promotion, and a full training library, all wired to convert browsing agents into paying students.",
  },
  {
    name: "Chaos to Closing Sales Page",
    image: "/project-chaos-sales-page.jpg",
    context:
      "A direct-response sales page engineered to fill the founder's discovery call calendar. It leads with the exact pain point the audience feels, then backs it with real trust stats before asking for the call, no soft sell.",
  },
  {
    name: "Chaos to Closing AI Funnel",
    image: "/project-chaos-ai-funnel.jpg",
    context:
      "A lead magnet funnel trading a free AI deal-prompt template for contact details, positioned to pull in agents already looking to modernize their marketing, then hand them straight into the coaching pipeline.",
  },
  {
    name: "Mindset Coaching",
    image: "/project-mindset-coaching.jpg",
    context:
      "A coaching funnel built around one job: turn a cold visitor into a booked discovery call. Clear positioning, a simple offer, and a direct path to the calendar, no distractions along the way.",
  },
  {
    name: "Words Like Alice",
    image: "/project-words-like-alice.jpg",
    context:
      "A brand landing page designed to build immediate trust and move visitors toward one clear action, built with a strong above-the-fold hook and a funnel that respects how little attention a first-time visitor gives a page.",
  },
  {
    name: "Melbourne Chiropractic",
    image: "/project-melbourne-chiropractic.png",
    context:
      "A local-service landing page built to turn map searches into booked appointments, structured around the trust signals a first-time patient looks for before picking up the phone.",
  },
  {
    name: "Dental Clinic",
    image: "/project-dental-clinic.jpg",
    context:
      "A conversion-focused site for a local dental practice, built to move new-patient traffic straight into a booked appointment instead of losing them to a generic contact form.",
  },
  {
    name: "Landscaping",
    image: "/project-landscaping.png",
    context:
      "A local-service site built for lead capture first: a clear service breakdown, a fast quote request, and a design that reads as established and trustworthy to homeowners comparing contractors.",
  },
  {
    name: "Digital Products",
    image: "/project-digital-products.jpg",
    context:
      "A digital product storefront built to convert cold traffic into a purchase in as few steps as possible, with a funnel structure that keeps the buyer's attention on the offer, not the exit.",
  },
];

function ProjectsGrid({ onSelect }: { onSelect: (index: number) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {projects.map((project, i) => (
        <button
          key={project.name}
          onClick={() => onSelect(i)}
          className="group relative aspect-[4/3] overflow-hidden rounded-[16px] text-left transition-transform hover:scale-[1.02]"
          style={{
            background: "var(--bg-surface-2)",
            backdropFilter: "var(--surface-blur)",
            WebkitBackdropFilter: "var(--surface-blur)",
            boxShadow:
              "var(--surface-shadow-sm)",
          }}
        >
          <Image
            src={project.image}
            alt={project.name}
            fill
            className="object-cover object-top"
            sizes="(min-width: 1024px) 15vw, 50vw"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 px-2.5 py-2"
            style={{ background: "linear-gradient(to top, rgba(10,10,9,0.9), transparent)" }}
          >
            <p className="text-[10px] font-medium leading-tight" style={{ color: "var(--text-primary)" }}>
              {project.name}
            </p>
          </div>
          <div
            className="pointer-events-none absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
            style={{ background: "rgba(20,19,17,0.85)", color: "#EF9F27" }}
          >
            <IconArrowUpRight size={13} />
          </div>
        </button>
      ))}
    </div>
  );
}

export default function AboutPanel() {
  const [awardsOpen, setAwardsOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [ratesOpen, setRatesOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState<number | null>(null);
  const [automationsOpen, setAutomationsOpen] = useState(false);
  const [testimonialsOpen, setTestimonialsOpen] = useState(false);

  const anyModalOpen =
    awardsOpen ||
    experienceOpen ||
    appsOpen ||
    ratesOpen ||
    projectOpen !== null ||
    automationsOpen ||
    testimonialsOpen;

  useEffect(() => {
    document.body.style.overflow = anyModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [anyModalOpen]);

  return (
    <div className="flex flex-col gap-3 lg:h-full lg:flex-row">
      {/* Left column, ~60% */}
      <div className="flex min-w-0 flex-col gap-3 lg:h-full lg:[flex:6_1_0%]">
        <div className="flex min-h-0 flex-col gap-3 lg:flex-row lg:min-h-[150px] lg:[flex:1_1_0%]">
          <div
            className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-[24px] lg:h-full lg:w-auto lg:flex-1"
            style={{
              background: "var(--bg-surface)",
              backdropFilter: "var(--surface-blur)",
              WebkitBackdropFilter: "var(--surface-blur)",
              boxShadow:
                "var(--surface-shadow)",
            }}
          >
            <div className="flex flex-col items-center gap-2.5">
              <span className="relative flex h-14 w-14 items-center justify-center">
                <span
                  className="pulse-ring absolute inline-flex h-full w-full rounded-full"
                  style={{ background: "#EF9F27" }}
                />
                <span
                  className="relative flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "#EF9F27", boxShadow: "0 0 20px 4px rgba(239,159,39,0.5)" }}
                >
                  <IconPlayerPlayFilled size={22} style={{ color: "var(--btn-text-on-gradient)" }} />
                </span>
              </span>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Video upload soon
              </p>
            </div>
          </div>
          <div className="relative h-64 lg:h-auto lg:min-h-0 lg:flex-1">
            <Card className="thin-scroll h-full overflow-y-auto">
            <p className="mb-3 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              I&apos;m a GoHighLevel specialist based in Manila, focused on automation. I help businesses replace
              manual, repetitive work with systems that run themselves, built with tools like{" "}
              <span style={{ color: "#EF9F27" }}>Claude</span>,{" "}
              <span style={{ color: "#EF9F27" }}>n8n</span>, and{" "}
              <span style={{ color: "#EF9F27" }}>Zapier</span>.
            </p>
            <p className="mb-3 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Most of my client work lives inside GoHighLevel: building funnels, CRM pipelines, and dashboards, then
              wiring them up to automations that handle follow-ups, lead routing, and reporting without anyone
              touching a spreadsheet.
            </p>
            <p className="mb-3 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Outside of GoHighLevel, I use Claude Code to build the tools I can&apos;t find off the shelf, and n8n
              or Zapier to connect everything else, forms, calendars, payment tools, into one system that just runs
              in the background.
            </p>
            <p className="mb-3 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Currently building <span style={{ color: "#EF9F27" }}>Pathwise</span>, a dashboard-style app for
              mapping out workflows visually, on top of taking on client automation projects one at a time.
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              I care less about which tool gets used and more about the outcome: fewer manual steps, faster response
              times, and systems a non-technical team can actually run without me in the loop.
            </p>
            </Card>
            <BottomFade />
            <ScrollHint />
          </div>
        </div>

        <div className="grid flex-none grid-cols-3 gap-3 lg:h-[150px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,2.4fr)]">
          <Card
            className="relative flex h-28 cursor-pointer flex-col items-center justify-center text-center transition-transform hover:scale-[1.02] lg:h-full"
            onClick={() => setAppsOpen(true)}
          >
            <ClickHint />
            <p
              className="text-4xl font-medium"
              style={{
                background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {apps.length}
            </p>
            <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
              Apps built
            </p>
          </Card>
          <Card
            className="relative flex h-28 cursor-pointer flex-col items-center justify-center text-center transition-transform hover:scale-[1.02] lg:h-full"
            onClick={() => setExperienceOpen(true)}
          >
            <ClickHint />
            <p
              className="text-4xl font-medium"
              style={{
                background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              5
            </p>
            <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
              Years experience
            </p>
          </Card>
          <Card
            className="relative flex h-28 cursor-pointer flex-col items-center justify-center text-center transition-transform hover:scale-[1.02] lg:h-full"
            onClick={() => setAwardsOpen(true)}
          >
            <ClickHint />
            <p
              className="text-4xl font-medium"
              style={{
                background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              4
            </p>
            <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
              Awards
            </p>
          </Card>
          <div
            className="relative col-span-3 h-40 overflow-hidden rounded-[24px] lg:col-span-1 lg:h-full"
            style={{
              boxShadow:
                "var(--surface-shadow)",
            }}
          >
            <iframe
              title="Manila map"
              src="https://www.google.com/maps?q=Manila,Philippines&z=11&output=embed"
              loading="lazy"
              className="absolute inset-0 h-full w-full"
              style={{
                border: 0,
                pointerEvents: "none",
                filter: "invert(92%) hue-rotate(180deg) brightness(0.95) contrast(0.9)",
              }}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="relative flex h-3 w-3">
                <span className="pulse-ring absolute inline-flex h-full w-full rounded-full" style={{ background: "#EF9F27" }} />
                <span
                  className="relative inline-flex h-3 w-3 rounded-full"
                  style={{ background: "#EF9F27", boxShadow: "0 0 10px 3px rgba(239,159,39,0.8)" }}
                />
              </span>
            </div>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 p-3"
              style={{ background: "linear-gradient(to top, rgba(10,10,9,0.85), transparent)" }}
            >
              <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                Based in
              </p>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                Manila, Philippines
              </p>
            </div>
          </div>
        </div>

        {/* Experience + Hobbies stacked on the left, Tools I use spanning the full height on the right */}
        <div className="flex flex-col gap-3 lg:flex-row lg:min-h-0 lg:[flex:2_1_0%]">
          <div className="flex flex-col gap-3 lg:min-h-0 lg:[flex:3_1_0%]">
            <Card className="relative flex h-96 flex-col lg:h-auto lg:min-h-0 lg:[flex:2_1_0%]">
              <p className="mb-2.5 flex-none text-[13px]" style={{ color: "var(--text-primary)" }}>
                Experience
              </p>
              <div className="thin-scroll min-h-0 flex-1 overflow-y-auto pr-1">
                {experience.map((item, i) => (
                  <div
                    key={item.company}
                    className="border-l-2 pl-3"
                    style={{ borderColor: "var(--border-surface)", marginBottom: i === experience.length - 1 ? 0 : 16 }}
                  >
                    <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                      {item.company}
                    </p>
                    <p className="mt-0.5 text-[11px]" style={{ color: "#EF9F27" }}>
                      {item.role}
                    </p>
                    <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {item.period}
                    </p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4">
                      {item.bullets.map((bullet) => (
                        <li key={bullet} className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <BottomFade />
              <ScrollHint />
            </Card>

            <div className="grid flex-none grid-cols-2 gap-3 lg:grid-cols-3">
              <Card
                className="col-span-2 cursor-pointer transition-transform hover:scale-[1.02] lg:col-span-1"
                onClick={() => setTestimonialsOpen(true)}
              >
                <p className="mb-1.5 text-[13px]" style={{ color: "var(--text-primary)" }}>
                  Client Testimonials
                </p>
                <p className="mb-2 text-[10px] leading-snug" style={{ color: "var(--text-muted)" }}>
                  Trusted by founders and teams across GoHighLevel builds.
                </p>
                <ClientAvatarGrid />
                <p className="text-[20px] font-medium leading-none" style={{ color: "#EF9F27" }}>
                  58
                </p>
                <p className="mt-1 text-[10px] leading-snug" style={{ color: "var(--text-muted)" }}>
                  Client projects completed
                </p>
              </Card>

              <Card className="relative hidden cursor-default flex-col items-center justify-center text-center lg:flex">
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  More content soon
                </p>
              </Card>

              <Card className="relative hidden cursor-default flex-col items-center justify-center text-center lg:flex">
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  More content soon
                </p>
              </Card>
            </div>
          </div>

          <Card className="relative flex h-96 flex-col lg:h-auto lg:min-h-0 lg:[flex:2_1_0%]">
            <p className="mb-2.5 flex-none text-[13px]" style={{ color: "var(--text-primary)" }}>
              Tools I use
            </p>
            <div className="thin-scroll min-h-0 flex-1 overflow-y-auto pr-1">
              {tools.map((tool, i) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.name}
                    className="flex items-start gap-3"
                    style={{ marginBottom: i === tools.length - 1 ? 0 : 14 }}
                  >
                    <div
                      className="flex h-10 w-10 flex-none items-center justify-center rounded-[14px]"
                      style={{
                        background: "var(--bg-surface-2)",
                        backdropFilter: "var(--surface-blur)",
                        WebkitBackdropFilter: "var(--surface-blur)",
                        boxShadow:
                          "var(--surface-shadow-xs)",
                      }}
                    >
                      <Icon
                        size={19}
                        style={{
                          color: tool.color,
                          filter:
                            "drop-shadow(0 1px 0 rgba(0,0,0,0.7)) drop-shadow(0 -0.5px 0 rgba(255,255,255,0.12))",
                        }}
                      />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                        {tool.name}
                      </p>
                      <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {tool.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <BottomFade />
            <ScrollHint />
          </Card>
        </div>
      </div>

      {/* Right column, ~40% on desktop; stacks below on mobile */}
      <div className="flex min-w-0 flex-col gap-3 lg:h-full lg:[flex:4_1_0%]">
        <Card className="relative flex h-80 flex-col lg:h-auto lg:min-h-0 lg:flex-1">
          <p className="mb-2.5 flex-none text-[13px]" style={{ color: "var(--text-primary)" }}>
            Projects
          </p>
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto pr-1">
            <ProjectsGrid onSelect={setProjectOpen} />
          </div>
          <BottomFade />
          <ScrollHint />
        </Card>
        <Card
          className="relative flex h-32 cursor-pointer flex-col items-center justify-center overflow-hidden text-center transition-transform hover:scale-[1.02] lg:h-auto lg:flex-1"
          onClick={() => setAutomationsOpen(true)}
        >
          <Image
            src="/automation-bg-pathwise.jpg"
            alt=""
            fill
            className="object-cover opacity-70"
            style={{ filter: "blur(0px)" }}
            sizes="300px"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(circle at center, rgba(216,90,48,0.2) 0%, rgba(28,26,23,0.35) 65%, rgba(20,19,17,0.55) 100%)",
            }}
          />
          <ClickHint />
          <div
            className="relative flex flex-col items-center rounded-[18px] px-6 py-3"
            style={{
              background: "rgba(20,19,17,0.55)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <p
              className="text-4xl font-medium"
              style={{
                background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {automationsTarget}
            </p>
            <p className="mt-1 text-[11px]" style={{ color: "var(--text-primary)" }}>
              Complex Automation Built
            </p>
          </div>
        </Card>
      </div>

      {awardsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain p-4 lg:p-6"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setAwardsOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-[24px] p-5 lg:p-6"
            style={{
              background: "var(--bg-surface)",
              backdropFilter: "var(--surface-blur)",
              WebkitBackdropFilter: "var(--surface-blur)",
              boxShadow:
                "var(--surface-shadow)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                GoHighLevel Champs · Awards
              </p>
              <button
                onClick={() => setAwardsOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "var(--bg-surface-2)", color: "var(--text-tertiary)" }}
              >
                <IconX size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {badges.map((badge) => (
                <div key={badge.name} className="flex flex-col items-center text-center">
                  <div className="relative mb-3 h-24 w-24 flex-none">
                    <Image src={badge.image} alt={badge.name} fill className="object-contain" sizes="96px" />
                  </div>
                  <p className="mb-1.5 text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                    {badge.name}
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {experienceOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain p-4 lg:p-6"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setExperienceOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-[24px] p-5 lg:p-6"
            style={{
              background: "var(--bg-surface)",
              backdropFilter: "var(--surface-blur)",
              WebkitBackdropFilter: "var(--surface-blur)",
              boxShadow:
                "var(--surface-shadow)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex flex-none items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                5 years in the making
              </p>
              <button
                onClick={() => setExperienceOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full"
                style={{ background: "var(--bg-surface-2)", color: "var(--text-tertiary)" }}
              >
                <IconX size={16} />
              </button>
            </div>
            <div className="thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              {journey.map((paragraph) => (
                <p key={paragraph} className="mb-3 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {paragraph}
                </p>
              ))}
              <div
                className="mt-4 rounded-[16px] p-4"
                style={{ background: "var(--bg-surface-2)" }}
              >
                <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Right now
                </p>
                <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  Now that I&apos;ve sharpened my GoHighLevel skills, I&apos;ve paired it with{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    AI and automation
                  </span>{" "}
                  to make the platform even more powerful, finding ways to push GHL further and work around the
                  limitations it has.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {appsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain p-4 lg:p-6"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setAppsOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-[24px] p-5 lg:p-6"
            style={{
              background: "var(--bg-surface)",
              backdropFilter: "var(--surface-blur)",
              WebkitBackdropFilter: "var(--surface-blur)",
              boxShadow:
                "var(--surface-shadow)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Apps built
              </p>
              <button
                onClick={() => setAppsOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "var(--bg-surface-2)", color: "var(--text-tertiary)" }}
              >
                <IconX size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {apps.map((app) => {
                const AppIcon = app.icon;
                return (
                  <div key={app.name} className="flex flex-col items-center text-center">
                    <div
                      className="mb-3 flex h-16 w-16 items-center justify-center rounded-[16px]"
                      style={{ background: "linear-gradient(135deg, #EF9F27, #D85A30)", color: "var(--btn-text-on-gradient)" }}
                    >
                      <AppIcon size={26} />
                    </div>
                    <p className="mb-1.5 text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                      {app.name}
                    </p>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                      {app.description}
                    </p>
                  </div>
                );
              })}
              {Array.from({ length: Math.max(0, 3 - apps.length) }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed p-4 text-center"
                  style={{ borderColor: "var(--border-surface-2)", color: "var(--text-faint)" }}
                >
                  <IconLayoutGrid size={20} />
                  <p className="text-[11px] leading-relaxed">More apps coming soon</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {ratesOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain p-4 lg:p-6"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setRatesOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-[24px] p-5 lg:p-6"
            style={{
              background: "var(--bg-surface)",
              backdropFilter: "var(--surface-blur)",
              WebkitBackdropFilter: "var(--surface-blur)",
              boxShadow:
                "var(--surface-shadow)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex flex-none items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                My rates
              </p>
              <button
                onClick={() => setRatesOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full"
                style={{ background: "var(--bg-surface-2)", color: "var(--text-tertiary)" }}
              >
                <IconX size={16} />
              </button>
            </div>
            <div className="thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              <p className="mb-4 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                More content coming soon.
              </p>
              <a
                href="/book"
                className="block w-full rounded-lg px-3 py-2.5 text-center text-xs font-medium hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                  boxShadow: "0 0 16px 0 rgba(216,90,48,0.4)",
                  color: "var(--btn-text-on-gradient)",
                }}
              >
                Client Intake
              </a>
            </div>
          </div>
        </div>
      )}

      {testimonialsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain p-4 lg:p-6"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setTestimonialsOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-[24px] p-5 lg:p-6"
            style={{
              background: "var(--bg-surface)",
              backdropFilter: "var(--surface-blur)",
              WebkitBackdropFilter: "var(--surface-blur)",
              boxShadow: "var(--surface-shadow)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex flex-none items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Client Testimonials
              </p>
              <button
                onClick={() => setTestimonialsOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full"
                style={{ background: "var(--bg-surface-2)", color: "var(--text-tertiary)" }}
              >
                <IconX size={16} />
              </button>
            </div>
            <div className="thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              <div className="flex flex-col gap-3">
                {clientTestimonials.map((t) => (
                  <div key={t.name} className="rounded-[16px] p-4" style={{ background: "var(--bg-surface-2)" }}>
                    <div className="mb-2 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <IconStarFilled key={i} size={13} style={{ color: "#EF9F27" }} />
                      ))}
                    </div>
                    <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <p className="mt-2.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      Name: <span style={{ color: "var(--text-primary)" }}>{t.name}</span>, {t.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {projectOpen !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain p-4 lg:p-6"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setProjectOpen(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-[24px] p-5 lg:p-6"
            style={{
              background: "var(--bg-surface)",
              backdropFilter: "var(--surface-blur)",
              WebkitBackdropFilter: "var(--surface-blur)",
              boxShadow:
                "var(--surface-shadow)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex flex-none items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {projects[projectOpen].name}
              </p>
              <button
                onClick={() => setProjectOpen(null)}
                aria-label="Close"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full"
                style={{ background: "var(--bg-surface-2)", color: "var(--text-tertiary)" }}
              >
                <IconX size={16} />
              </button>
            </div>
            <p className="mb-3 flex-none text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {projects[projectOpen].context}
            </p>
            <div className="thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[16px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={projects[projectOpen].image}
                alt={projects[projectOpen].name}
                className="w-full"
              />
            </div>
            <p className="mt-3 flex-none text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
              Full live preview coming soon
            </p>
          </div>
        </div>
      )}

      {automationsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain p-4 lg:p-6"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setAutomationsOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-[24px] p-5 lg:p-6"
            style={{
              background: "var(--bg-surface)",
              backdropFilter: "var(--surface-blur)",
              WebkitBackdropFilter: "var(--surface-blur)",
              boxShadow:
                "var(--surface-shadow)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex flex-none items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Complex Automation Built
              </p>
              <button
                onClick={() => setAutomationsOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full"
                style={{ background: "var(--bg-surface-2)", color: "var(--text-tertiary)" }}
              >
                <IconX size={16} />
              </button>
            </div>
            <div className="thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              {automations.map((automation) => (
                <div key={automation.name} className="mb-4 overflow-hidden rounded-[16px]" style={{ background: "var(--bg-surface-2)" }}>
                  <img src={automation.image} alt={automation.name} className="w-full" />
                  <div className="p-3">
                    <p className="mb-1 text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                      {automation.name}
                    </p>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                      {automation.description}
                    </p>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: Math.max(automationsTarget - automations.length, 0) }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed p-6 text-center"
                    style={{ borderColor: "var(--border-surface-2)", color: "var(--text-faint)" }}
                  >
                    <IconLayoutGrid size={20} />
                    <p className="text-[11px] leading-relaxed">More automations coming soon</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
