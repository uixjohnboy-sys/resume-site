export default function Logo({ size = 26 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex flex-none items-center justify-center rounded-[9px]"
        style={{
          width: size,
          height: size,
          background: "#141311",
          boxShadow:
            "2px 2px 5px rgba(0,0,0,0.6), -1.5px -1.5px 4px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGrad" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#EF9F27" />
              <stop offset="1" stopColor="#D85A30" />
            </linearGradient>
          </defs>
          <text
            x="32"
            y="45"
            fontFamily="var(--font-sans), Arial, Helvetica, sans-serif"
            fontSize="30"
            fontWeight="800"
            letterSpacing="-1.5"
            textAnchor="middle"
            fill="url(#logoGrad)"
          >
            JB
          </text>
        </svg>
      </div>
      <p className="text-[15px] font-medium tracking-[-0.01em]" style={{ color: "#F5F4F0" }}>
        John<span style={{ color: "#8A887F" }}>boy</span>
      </p>
    </div>
  );
}
