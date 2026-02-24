import { Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SCENES, COLORS } from "../constants";

const BENEFITS = [
  { icon: "✓", text: "Single pane of glass for all security operations" },
  { icon: "✓", text: "Automated report generation in seconds" },
  { icon: "✓", text: "Quantified financial risk for board decisions" },
  { icon: "✓", text: "Continuous compliance with audit evidence" },
];

export function Solution() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = SCENES.SOLUTION;
  const localFrame = frame - s.from;

  const headingOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(localFrame, [s.duration - 15, s.duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <Sequence from={s.from} durationInFrames={s.duration}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 120, opacity: exitOpacity }}>
        <div style={{
          fontSize: 14, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const,
          color: COLORS.SUCCESS, opacity: headingOpacity, marginBottom: 16,
        }}>
          The Solution
        </div>

        <div style={{
          fontSize: 44, fontWeight: 700, textAlign: "center" as const,
          opacity: headingOpacity, marginBottom: 60, lineHeight: 1.2,
        }}>
          One platform. Complete visibility.
        </div>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 20, maxWidth: 700 }}>
          {BENEFITS.map((b, i) => {
            const delay = 30 + i * 20;
            const itemOpacity = interpolate(localFrame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const itemX = interpolate(localFrame, [delay, delay + 15], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 20,
                opacity: itemOpacity, transform: `translateX(${itemX}px)`,
                fontSize: 22, color: COLORS.TEXT_SECONDARY,
              }}>
                <span style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: `${COLORS.SUCCESS}20`, color: COLORS.SUCCESS,
                  fontSize: 20, fontWeight: 700,
                }}>
                  {b.icon}
                </span>
                <span>{b.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Sequence>
  );
}
