export default function Card({
  children,
  className = "",
  style = {},
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[24px] p-4 ${className}`}
      style={{
        background: "#1C1A17",
        boxShadow:
          "10px 10px 22px rgba(0,0,0,0.55), -8px -8px 20px rgba(255,255,255,0.025), inset 0 1px 0 rgba(255,255,255,0.02)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
