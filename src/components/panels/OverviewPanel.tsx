export default function OverviewPanel({ onNavigate }: { onNavigate: (key: "about" | "projects") => void }) {
  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-3">
        {[
          { label: "Apps built", value: "3" },
          { label: "Years experience", value: "5" },
          { label: "Based in", value: "Manila" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-4" style={{ background: "var(--bg-card, #211F1B)" }}>
            <p className="mb-1 text-[11px]" style={{ color: "#6B6960" }}>
              {stat.label}
            </p>
            <p className="text-xl" style={{ color: "#F2F1EE" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-4" style={{ background: "var(--bg-card, #211F1B)" }}>
        <p className="mb-2" style={{ color: "#F2F1EE" }}>
          Howdy
        </p>
        <p className="text-[13px] leading-relaxed" style={{ color: "#B0AEA4" }}>
          I design and build dashboard tools and workflow apps. Open{" "}
          <button className="text-[#EF9F27] underline-offset-2 hover:underline" onClick={() => onNavigate("about")}>
            About me
          </button>{" "}
          for the full story, or{" "}
          <button className="text-[#EF9F27] underline-offset-2 hover:underline" onClick={() => onNavigate("projects")}>
            Projects
          </button>{" "}
          to see what I&apos;ve shipped, like Pathwise.
        </p>
      </div>
    </div>
  );
}
