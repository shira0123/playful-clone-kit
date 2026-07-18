export function SectionDivider({
  from = "navy",
  to = "background",
  flip = false,
}: {
  from?: "navy" | "background" | "secondary";
  to?: "navy" | "background" | "secondary";
  flip?: boolean;
}) {
  const fill = `var(--${to === "background" ? "background" : to})`;
  const bg = `var(--${from === "background" ? "background" : from})`;
  return (
    <div style={{ background: bg }} aria-hidden className="leading-[0]">
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className={`block w-full h-[40px] md:h-[60px] ${flip ? "rotate-180" : ""}`}
      >
        <path d="M0,32 C240,64 480,0 720,24 C960,48 1200,16 1440,40 L1440,60 L0,60 Z" fill={fill} />
      </svg>
    </div>
  );
}
