type GlyphGridProps = {
  className?: string;
  cols?: number;
  rows?: number;
};

export function GlyphGrid({ className = "", cols = 8, rows = 3 }: GlyphGridProps) {
  return (
    <div
      className={`grid gap-1 ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: cols * rows }).map((_, index) => (
        <span
          key={index}
          className={`h-1.5 w-1.5 rounded-full ${
            index % 7 === 0 ? "bg-signal" : "bg-white/25"
          }`}
        />
      ))}
    </div>
  );
}
