import Image from "next/image";
import {
  IconLayoutGrid,
  IconBrandFigma,
  IconBrandFramer,
  IconRobot,
  IconBrandReact,
  IconBrandNotion,
} from "@tabler/icons-react";

const hobbies = ["Basketball", "Photography", "Gaming", "Sci-fi"];

const experience = [
  { role: "Product designer, freelance", period: "2022 to present" },
  { role: "UI designer, agency", period: "2019 to 2022" },
  { role: "Junior designer, startup", period: "2018 to 2019" },
  { role: "Design intern", period: "2017 to 2018" },
];

const tools = [
  { name: "Figma", icon: IconBrandFigma, description: "High-fidelity UI design and prototyping." },
  { name: "Framer", icon: IconBrandFramer, description: "Building and publishing interactive sites fast." },
  { name: "Claude Code", icon: IconRobot, description: "Pairing on code, from prototype to production." },
  { name: "React", icon: IconBrandReact, description: "Building the actual product interfaces." },
  { name: "Notion", icon: IconBrandNotion, description: "Planning projects and keeping notes organized." },
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl p-4 ${className}`} style={{ background: "var(--bg-card, #211F1B)" }}>
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

function PlaceholderCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center ${className}`}
      style={{ borderColor: "#3A382F", color: "#5A584F" }}
    >
      <IconLayoutGrid size={18} />
      <p className="text-[11px] leading-relaxed">Reserved</p>
    </div>
  );
}

export default function AboutPanel() {
  return (
    <div className="grid grid-cols-[6fr_4fr] items-start gap-3">
      {/* Left column, ~60% */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex h-64 gap-3">
          <div className="relative h-full w-[220px] flex-none overflow-hidden rounded-xl">
            <Image src="/johnboy.png" alt="John Boy" fill className="object-cover" sizes="220px" priority />
          </div>
          <Card className="min-h-0 flex-1 overflow-y-auto">
            <p className="mb-2 text-[11px]" style={{ color: "#6B6960" }}>
              johnboy / about.md
            </p>
            <p className="mb-2" style={{ color: "#F2F1EE" }}>
              Howdy
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#B0AEA4" }}>
              I&apos;m a product designer and builder based in Manila. I turn rough ideas into working apps, with a
              focus on dashboards and workflow tools that remove friction from a process. Currently building{" "}
              <span style={{ color: "#EF9F27" }}>Pathwise</span>.
            </p>
          </Card>
        </div>

        <div className="grid h-[170px] grid-cols-[1fr_1fr_1.6fr] gap-3">
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

        <Card>
          <p className="mb-2.5 text-[13px]" style={{ color: "#F2F1EE" }}>
            Experience
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {experience.map((item) => (
              <div key={item.role} className="border-l-2 pl-3" style={{ borderColor: "#2A2822" }}>
                <p className="mb-0.5 text-xs" style={{ color: "#F2F1EE" }}>
                  {item.role}
                </p>
                <p className="text-[11px]" style={{ color: "#6B6960" }}>
                  {item.period}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="min-h-[280px]">
          <p className="mb-2.5 text-[13px]" style={{ color: "#F2F1EE" }}>
            Tools I use
          </p>
          <div className="thin-scroll max-h-[320px] overflow-y-auto pr-1">
            {tools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.name}
                  className="flex items-start gap-3"
                  style={{ marginBottom: i === tools.length - 1 ? 0 : 16 }}
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

        <Card>
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

      {/* Right column, ~40%, reserved for future content */}
      <div className="sticky top-0 flex min-w-0 flex-col gap-3">
        <PlaceholderCard />
        <PlaceholderCard />
        <PlaceholderCard />
      </div>
    </div>
  );
}
