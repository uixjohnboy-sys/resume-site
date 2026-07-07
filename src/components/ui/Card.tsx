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
      className={`rounded-[20px] border p-4 ${className}`}
      style={{
        background: "linear-gradient(180deg, #242220 0%, #1B1917 100%)",
        borderColor: "rgba(255,255,255,0.06)",
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 10px 28px -10px rgba(0,0,0,0.6)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
