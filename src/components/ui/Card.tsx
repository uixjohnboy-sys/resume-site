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
        background: "var(--bg-surface)",
        backdropFilter: "var(--surface-blur)",
        WebkitBackdropFilter: "var(--surface-blur)",
        boxShadow: "var(--surface-shadow)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
