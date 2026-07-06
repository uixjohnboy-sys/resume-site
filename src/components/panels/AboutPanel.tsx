const tools = ["Figma", "Framer", "Claude Code", "React", "Notion"];
const hobbies = ["Basketball", "Photography", "Gaming", "Sci-fi"];

const experience = [
  { role: "Product designer, freelance", period: "2022 to present" },
  { role: "UI designer, agency", period: "2019 to 2022" },
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

export default function AboutPanel() {
  return (
    <div>
      <div className="mb-3 grid grid-cols-[180px_1fr] gap-3">
        <div
          className="flex aspect-square items-center justify-center overflow-hidden rounded-xl p-2 text-center text-xs"
          style={{ background: "linear-gradient(135deg, #3a2a1a, #141311)", color: "#5A584F" }}
        >
          your photo here
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--bg-card, #211F1B)" }}>
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
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ background: "var(--bg-card, #211F1B)" }}>
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
        </div>
        <div className="rounded-xl p-4" style={{ background: "var(--bg-card, #211F1B)" }}>
          <p className="mb-2.5 text-[13px]" style={{ color: "#F2F1EE" }}>
            Hobbies
          </p>
          <div>
            {hobbies.map((h) => (
              <Tag key={h} label={h} />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: "var(--bg-card, #211F1B)" }}>
        <p className="mb-2.5 text-[13px]" style={{ color: "#F2F1EE" }}>
          Tools I use
        </p>
        <div>
          {tools.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
