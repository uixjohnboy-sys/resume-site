import Image from "next/image";
import { IconLayoutGrid } from "@tabler/icons-react";

const tools = ["Figma", "Framer", "Claude Code", "React", "Notion"];
const hobbies = ["Basketball", "Photography", "Gaming", "Sci-fi"];

const experience = [
  { role: "Product designer, freelance", period: "2022 to present" },
  { role: "UI designer, agency", period: "2019 to 2022" },
];

const stats = [
  { label: "Apps built", value: "3" },
  { label: "Years experience", value: "5" },
  { label: "Based in", value: "Manila" },
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

function PlaceholderCard({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center ${className}`}
      style={{ borderColor: "#3A382F", color: "#5A584F" }}
    >
      <IconLayoutGrid size={18} />
      <p className="text-[11px] leading-relaxed">{label}</p>
    </div>
  );
}

export default function AboutPanel() {
  return (
    <div className="grid grid-cols-[7fr_3fr] gap-3">
      {/* Left column, ~70% */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-[180px_1fr] gap-3">
          <div className="relative aspect-square overflow-hidden rounded-xl">
            <Image src="/johnboy.png" alt="John Boy" fill className="object-cover" sizes="180px" priority />
          </div>
          <Card>
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

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <p className="mb-1 text-[11px]" style={{ color: "#6B6960" }}>
                {stat.label}
              </p>
              <p className="text-xl" style={{ color: "#F2F1EE" }}>
                {stat.value}
              </p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="mb-2.5 text-[13px]" style={{ color: "#F2F1EE" }}>
              Experience
            </p>
            {experience.map((item, i) => (
              <div
                key={item.role}
                className="border-l-2 pl-3"
                style={{ borderColor: "#2A2822", marginBottom: i === experience.length - 1 ? 0 : 12 }}
              >
                <p className="mb-0.5 text-xs" style={{ color: "#F2F1EE" }}>
                  {item.role}
                </p>
                <p className="text-[11px]" style={{ color: "#6B6960" }}>
                  {item.period}
                </p>
              </div>
            ))}
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

        <Card>
          <p className="mb-2.5 text-[13px]" style={{ color: "#F2F1EE" }}>
            Tools I use
          </p>
          <div>
            {tools.map((t) => (
              <Tag key={t} label={t} />
            ))}
          </div>
        </Card>
      </div>

      {/* Right column, ~30%, reserved for future content */}
      <div className="flex flex-col gap-3">
        <PlaceholderCard label="Reserved" className="h-[100px]" />
        <PlaceholderCard label="Reserved" className="h-[140px]" />
        <PlaceholderCard label="Reserved" className="flex-1" />
      </div>
    </div>
  );
}
