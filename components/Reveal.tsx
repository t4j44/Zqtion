export default function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "text",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "text" | "card" | "visual";
}) {
  return (
    <div className={`reveal reveal-${variant} ${className}`} style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}>
      {children}
    </div>
  );
}
