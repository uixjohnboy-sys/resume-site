import {
  IconLayoutGrid,
  IconBrandFigma,
  IconBrandFramer,
  IconRobot,
  IconBrandReact,
  IconBrandNotion,
  IconBrandVscode,
  IconBrandGithub,
  IconBrandVercel,
  IconBrandSlack,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";

const hobbies = ["Basketball", "Photography", "Gaming", "Sci-fi"];

const experience = [
  {
    company: "Pathwise",
    role: "Founder / product designer",
    period: "2024 to present",
    description: "Designing and building the dashboard-style workflow mapping app from the ground up.",
  },
  {
    company: "Freelance",
    role: "Product designer",
    period: "2022 to present",
    description: "Designing and building dashboard tools and internal apps for small teams and startups.",
  },
  {
    company: "GoHighLevel agency partners",
    role: "GoHighLevel expert / funnel builder",
    period: "2021 to 2023",
    description: "Built automations, funnels, and client dashboards on the GoHighLevel platform.",
  },
  {
    company: "Bright Digital Studio",
    role: "UI designer",
    period: "2019 to 2022",
    description: "Worked across web and mobile projects for retail and fintech clients.",
  },
  {
    company: "Northlane Software",
    role: "Junior designer",
    period: "2018 to 2019",
    description: "Supported the design team on internal tools and marketing site refreshes.",
  },
  {
    company: "Studio Atlas",
    role: "Design intern",
    period: "2017 to 2018",
    description: "First hands-on design role, assisting with layout and asset production.",
  },
];

const tools = [
  {
    name: "Figma",
    icon: IconBrandFigma,
    description:
      "My main tool for high-fidelity UI design and prototyping. I build out full screens and interactive flows here before anything gets built in code.",
  },
  {
    name: "Framer",
    icon: IconBrandFramer,
    description:
      "For quickly building and publishing marketing sites and landing pages without waiting on a full development cycle.",
  },
  {
    name: "Claude Code",
    icon: IconRobot,
    description:
      "My pair programmer for turning designs into working apps, from first prototype all the way through to production code.",
  },
  {
    name: "React",
    icon: IconBrandReact,
    description:
      "The framework behind the actual product interfaces I ship, usually paired with Next.js for anything that needs routing.",
  },
  {
    name: "Notion",
    icon: IconBrandNotion,
    description:
      "Where I plan projects, keep client notes organized, and track the roadmap for everything I'm currently building.",
  },
  {
    name: "VS Code",
    icon: IconBrandVscode,
    description:
      "My day-to-day editor for anything that isn't AI-paired, plus reviewing and cleaning up code that Claude Code generates.",
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
    name: "Slack",
    icon: IconBrandSlack,
    description:
      "Where client and team communication happens day to day, from quick questions to sharing work in progress.",
  },
];

function Card({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`rounded-xl p-4 ${className}`} style={{ background: "var(--bg-card, #211F1B)", ...style }}>
      {children}
    </div>
  );
}

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

function PlaceholderCard() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center"
      style={{ borderColor: "#3A382F", color: "#5A584F" }}
    >
      <IconLayoutGrid size={18} />
      <p className="text-[11px] leading-relaxed">Reserved</p>
    </div>
  );
}

export default function AboutPanel() {
  return (
    <div className="flex h-full gap-3">
      {/* Left column, ~60% */}
      <div className="flex h-full min-w-0 flex-col gap-3" style={{ flex: "6 1 0%" }}>
        <div className="flex min-h-0 gap-3" style={{ flex: "1 1 0%", minHeight: 150 }}>
          <div
            className="relative flex h-full flex-1 items-center justify-center overflow-hidden rounded-xl"
            style={{ background: "linear-gradient(160deg, #3a2a1a, #1D1B18 70%)" }}
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
          <Card className="thin-scroll min-h-0 flex-1 overflow-y-auto">
            <p className="mb-2 text-[11px]" style={{ color: "#6B6960" }}>
              johnboy / about.md
            </p>
            <p className="mb-2" style={{ color: "#F2F1EE" }}>
              Howdy
            </p>
            <p className="mb-3 text-[13px] leading-relaxed" style={{ color: "#B0AEA4" }}>
              I&apos;m a product designer and builder based in Manila. I turn rough ideas into working apps, with a
              focus on dashboards and workflow tools that remove friction from a process. Currently building{" "}
              <span style={{ color: "#EF9F27" }}>Pathwise</span>.
            </p>
            <p className="mb-3 text-[13px] leading-relaxed" style={{ color: "#B0AEA4" }}>
              My background is in product design, but over the last few years I&apos;ve leaned hard into shipping
              the actual product myself instead of only handing off mockups. I like projects where the interface has
              real state to manage, not just static screens, dashboards, editors, and tools people use every day.
            </p>
            <p className="mb-3 text-[13px] leading-relaxed" style={{ color: "#B0AEA4" }}>
              Most of my recent work has been split between client projects on GoHighLevel and building my own
              products, like Pathwise, from scratch. I care a lot about the small details of an interface, spacing,
              motion, the way a state change feels, more than most people notice consciously but everyone feels.
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#B0AEA4" }}>
              Outside of client work, I&apos;m usually deep in a personal project, testing out a new tool, or
              rebuilding something I already shipped because I found a cleaner way to do it.
            </p>
          </Card>
        </div>

        <div className="grid flex-none grid-cols-[1fr_1fr_1.6fr] gap-3" style={{ height: 150 }}>
          <Card className="flex h-full flex-col justify-center">
            <p className="mb-1 text-[11px]" style={{ color: "#6B6960" }}>
              Apps built
            </p>
            <p className="text-xl" style={{ color: "#F2F1EE" }}>
              3
            </p>
          </Card>
          <Card className="flex h-full flex-col justify-center">
            <p className="mb-1 text-[11px]" style={{ color: "#6B6960" }}>
              Years experience
            </p>
            <p className="text-xl" style={{ color: "#F2F1EE" }}>
              5
            </p>
          </Card>
          <div className="relative h-full overflow-hidden rounded-xl">
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
            <Card className="flex min-h-0 flex-col" style={{ flex: "2 1 0%" }}>
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
                    <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "#8A887F" }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
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

          <Card className="flex min-h-0 flex-col" style={{ flex: "2 1 0%" }}>
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
                      className="flex h-9 w-9 flex-none items-center justify-center rounded-lg"
                      style={{ background: "var(--bg-card-alt, #2A2822)", color: "#EF9F27" }}
                    >
                      <Icon size={18} />
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
          </Card>
        </div>
      </div>

      {/* Right column, ~40%, reserved for future content */}
      <div className="flex h-full min-w-0 flex-col gap-3" style={{ flex: "4 1 0%" }}>
        <PlaceholderCard />
        <PlaceholderCard />
        <PlaceholderCard />
      </div>
    </div>
  );
}
