"use client";

import { useState } from "react";
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
} from "@tabler/icons-react";
import Card from "@/components/ui/Card";

const hobbies = ["Basketball", "Photography", "Gaming", "Sci-fi"];

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

const experience = [
  {
    company: "Jessica Conner Business Consulting",
    role: "GoHighLevel Specialist — Automation (n8n, Zapier, Claude)",
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
    description:
      "My AI pair for building automations, writing code, and thinking through client workflows before anything gets built.",
  },
  {
    name: "n8n",
    icon: IconSitemap,
    description:
      "For building the automation flows that connect GoHighLevel to everything else a client's business runs on.",
  },
  {
    name: "Zapier",
    icon: IconBrandZapier,
    description:
      "The quick-connect tool I reach for when a client's stack needs two apps talking to each other fast.",
  },
  {
    name: "Figma",
    icon: IconBrandFigma,
    description:
      "For designing funnel pages, landing pages, and UI before they go live in GoHighLevel or on the web.",
  },
  {
    name: "GitHub",
    icon: IconBrandGithub,
    description:
      "Where every project lives, gets version controlled, and gets reviewed before it ships anywhere else.",
  },
  {
    name: "Vercel",
    icon: IconBrandVercel,
    description:
      "My default host for shipping projects fast, connected straight to GitHub so every push goes live automatically.",
  },
  {
    name: "Photoshop",
    icon: IconBrandAdobePhotoshop,
    description: "For photo editing and graphics, mostly ad creative and social assets for client campaigns.",
  },
  {
    name: "Illustrator",
    icon: IconBrandAdobeIllustrator,
    description: "For logos, icons, and vector graphics that need to stay clean at any size.",
  },
  {
    name: "Adobe Premiere Pro",
    icon: IconBrandAdobePremiere,
    description: "For longer-form video editing, mainly VSLs and client campaign videos.",
  },
  {
    name: "CapCut",
    icon: IconMovie,
    description: "My go-to for quick social media edits and short-form video content.",
  },
  {
    name: "Slack",
    icon: IconBrandSlack,
    description:
      "Where client and team communication happens day to day, from quick questions to sharing work in progress.",
  },
  {
    name: "ClickUp",
    icon: IconLayoutKanban,
    description: "Where I plan projects, track tasks, and keep every client engagement organized.",
  },
];

function Tag({ label }: { label: string }) {
  return (
    <span
      className="mb-1.5 mr-1.5 inline-block rounded-lg px-2.5 py-1 text-[11px]"
      style={{ background: "var(--bg-card-alt, #2A2822)", color: "#B0AEA4" }}
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
        style={{ color: "#5A584F", writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        Scroll down
      </span>
      <IconArrowDown size={11} style={{ color: "#5A584F" }} />
    </div>
  );
}

function PlaceholderCard() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed text-center"
      style={{ borderColor: "#3A382F", color: "#5A584F" }}
    >
      <IconLayoutGrid size={18} />
      <p className="text-[11px] leading-relaxed">Reserved</p>
    </div>
  );
}

export default function AboutPanel() {
  const [awardsOpen, setAwardsOpen] = useState(false);

  return (
    <div className="flex h-full gap-3">
      {/* Left column, ~60% */}
      <div className="flex h-full min-w-0 flex-col gap-3" style={{ flex: "6 1 0%" }}>
        <div className="flex min-h-0 gap-3" style={{ flex: "1 1 0%", minHeight: 150 }}>
          <div
            className="relative flex h-full flex-1 items-center justify-center overflow-hidden rounded-[24px]"
            style={{
              background: "#1C1A17",
              boxShadow:
                "10px 10px 22px rgba(0,0,0,0.55), -8px -8px 20px rgba(255,255,255,0.025), inset 0 1px 0 rgba(255,255,255,0.02)",
            }}
          >
            <span className="relative flex h-14 w-14 items-center justify-center">
              <span
                className="pulse-ring absolute inline-flex h-full w-full rounded-full"
                style={{ background: "#EF9F27" }}
              />
              <span
                className="relative flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "#EF9F27", boxShadow: "0 0 20px 4px rgba(239,159,39,0.5)" }}
              >
                <IconPlayerPlayFilled size={22} style={{ color: "#2C1400" }} />
              </span>
            </span>
          </div>
          <div className="relative min-h-0 flex-1">
            <Card className="thin-scroll h-full overflow-y-auto">
              <p className="mb-2 text-[11px]" style={{ color: "#6B6960" }}>
                johnboy / about.md
              </p>
              <p className="mb-2" style={{ color: "#F2F1EE" }}>
                Howdy
              </p>
            <p className="mb-3 text-[13px] leading-relaxed" style={{ color: "#B0AEA4" }}>
              I&apos;m a GoHighLevel specialist based in Manila, focused on automation. I help businesses replace
              manual, repetitive work with systems that run themselves, built with tools like{" "}
              <span style={{ color: "#EF9F27" }}>Claude</span>,{" "}
              <span style={{ color: "#EF9F27" }}>n8n</span>, and{" "}
              <span style={{ color: "#EF9F27" }}>Zapier</span>.
            </p>
            <p className="mb-3 text-[13px] leading-relaxed" style={{ color: "#B0AEA4" }}>
              Most of my client work lives inside GoHighLevel: building funnels, CRM pipelines, and dashboards, then
              wiring them up to automations that handle follow-ups, lead routing, and reporting without anyone
              touching a spreadsheet.
            </p>
            <p className="mb-3 text-[13px] leading-relaxed" style={{ color: "#B0AEA4" }}>
              Outside of GoHighLevel, I use Claude Code to build the tools I can&apos;t find off the shelf, and n8n
              or Zapier to connect everything else, forms, calendars, payment tools, into one system that just runs
              in the background.
            </p>
            <p className="mb-3 text-[13px] leading-relaxed" style={{ color: "#B0AEA4" }}>
              Currently building <span style={{ color: "#EF9F27" }}>Pathwise</span>, a dashboard-style app for
              mapping out workflows visually, on top of taking on client automation projects one at a time.
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#B0AEA4" }}>
              I care less about which tool gets used and more about the outcome: fewer manual steps, faster response
              times, and systems a non-technical team can actually run without me in the loop.
            </p>
            </Card>
            <ScrollHint />
          </div>
        </div>

        <div
          className="grid flex-none gap-3"
          style={{ height: 150, gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,2.4fr)" }}
        >
          <Card className="flex h-full flex-col items-center justify-center text-center">
            <p
              className="text-4xl font-medium"
              style={{
                background: "linear-gradient(135deg, #EF9F27, #D85A30)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              3
            </p>
            <p className="mt-1 text-[11px]" style={{ color: "#6B6960" }}>
              Apps built
            </p>
          </Card>
          <Card className="flex h-full flex-col items-center justify-center text-center">
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
            <p className="mt-1 text-[11px]" style={{ color: "#6B6960" }}>
              Years experience
            </p>
          </Card>
          <Card
            className="flex h-full cursor-pointer flex-col items-center justify-center text-center transition-transform hover:scale-[1.02]"
            onClick={() => setAwardsOpen(true)}
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
              4
            </p>
            <p className="mt-1 text-[11px]" style={{ color: "#6B6960" }}>
              Awards
            </p>
          </Card>
          <div
            className="relative h-full overflow-hidden rounded-[24px]"
            style={{
              boxShadow:
                "10px 10px 22px rgba(0,0,0,0.55), -8px -8px 20px rgba(255,255,255,0.025), inset 0 1px 0 rgba(255,255,255,0.02)",
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
              <p className="text-[11px]" style={{ color: "#D5D3CB" }}>
                Based in
              </p>
              <p className="text-sm" style={{ color: "#F2F1EE" }}>
                Manila, Philippines
              </p>
            </div>
          </div>
        </div>

        {/* Experience + Hobbies stacked on the left, Tools I use spanning the full height on the right */}
        <div className="flex min-h-0 gap-3" style={{ flex: "2 1 0%" }}>
          <div className="flex min-h-0 flex-col gap-3" style={{ flex: "3 1 0%" }}>
            <Card className="relative flex min-h-0 flex-col" style={{ flex: "2 1 0%" }}>
              <p className="mb-2.5 flex-none text-[13px]" style={{ color: "#F2F1EE" }}>
                Experience
              </p>
              <div className="thin-scroll min-h-0 flex-1 overflow-y-auto pr-1">
                {experience.map((item, i) => (
                  <div
                    key={item.company}
                    className="border-l-2 pl-3"
                    style={{ borderColor: "#2A2822", marginBottom: i === experience.length - 1 ? 0 : 16 }}
                  >
                    <p className="text-xs" style={{ color: "#F2F1EE" }}>
                      {item.company}
                    </p>
                    <p className="mt-0.5 text-[11px]" style={{ color: "#EF9F27" }}>
                      {item.role}
                    </p>
                    <p className="mt-0.5 text-[11px]" style={{ color: "#6B6960" }}>
                      {item.period}
                    </p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4">
                      {item.bullets.map((bullet) => (
                        <li key={bullet} className="text-[11px] leading-relaxed" style={{ color: "#8A887F" }}>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <ScrollHint />
            </Card>

            <Card className="flex-none">
              <p className="mb-2.5 text-[13px]" style={{ color: "#F2F1EE" }}>
                Hobbies
              </p>
              <div>
                {hobbies.map((h) => (
                  <Tag key={h} label={h} />
                ))}
              </div>
            </Card>
          </div>

          <Card className="relative flex min-h-0 flex-col" style={{ flex: "2 1 0%" }}>
            <p className="mb-2.5 flex-none text-[13px]" style={{ color: "#F2F1EE" }}>
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
                        background: "#141311",
                        boxShadow:
                          "3px 3px 7px rgba(0,0,0,0.6), -2px -2px 6px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.03)",
                      }}
                    >
                      <Icon
                        size={19}
                        style={{
                          color: "#E6DFCE",
                          filter:
                            "drop-shadow(0 1px 0 rgba(0,0,0,0.7)) drop-shadow(0 -0.5px 0 rgba(255,255,255,0.12))",
                        }}
                      />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-xs" style={{ color: "#F2F1EE" }}>
                        {tool.name}
                      </p>
                      <p className="text-[11px] leading-relaxed" style={{ color: "#6B6960" }}>
                        {tool.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <ScrollHint />
          </Card>
        </div>
      </div>

      {/* Right column, ~40%, reserved for future content */}
      <div className="flex h-full min-w-0 flex-col gap-3" style={{ flex: "4 1 0%" }}>
        <PlaceholderCard />
        <PlaceholderCard />
        <PlaceholderCard />
      </div>

      {awardsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setAwardsOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-[24px] p-6"
            style={{
              background: "#1C1A17",
              boxShadow:
                "10px 10px 22px rgba(0,0,0,0.55), -8px -8px 20px rgba(255,255,255,0.025), inset 0 1px 0 rgba(255,255,255,0.02)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "#F2F1EE" }}>
                GoHighLevel Champs · Awards
              </p>
              <button
                onClick={() => setAwardsOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: "#141311", color: "#8A887F" }}
              >
                <IconX size={16} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {badges.map((badge) => (
                <div key={badge.name} className="flex flex-col items-center text-center">
                  <div className="relative mb-3 h-24 w-24 flex-none">
                    <Image src={badge.image} alt={badge.name} fill className="object-contain" sizes="96px" />
                  </div>
                  <p className="mb-1.5 text-xs font-medium" style={{ color: "#F2F1EE" }}>
                    {badge.name}
                  </p>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#8A887F" }}>
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
