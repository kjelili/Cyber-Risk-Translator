import { Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SCENES, COLORS } from "../constants";

const PROBLEMS = [
  { icon: "📊", text: "Scattered tools with no unified risk view" },
  { icon: "⏰", text: "10-30 hours rewriting reports per engagement" },
  { icon: "💸", text: "Executives see security as a cost center" },
  { icon: "📋", text: "Manual compliance tracking in spreadsheets" },
];

export function Problem() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = SCENES.PROBLEM;

  const headingOpacity = interpolate(frame - s.from, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame - s.from, [s.duration - 20, s.duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <Sequence from={s.from} durationInFrames={s.duration}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 120, opacity: exitOpacity }}>
        {/* Section label */}
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 3,
          textTransform: "uppercase" as const,
          color: COLORS.DANGER,
          opacity: headingOpacity,
          marginBottom: 16,
        }}>
          The Problem
        </div>

        <div style={{
          fontSize: 44,
          fontWeight: 700,
          textAlign: "center" as const,
          opacity: headingOpacity,
          marginBottom: 60,
          lineHeight: 1.2,
        }}>
          Security teams are drowning in data
        </div>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" as const, justifyContent: "center" }}>
          {PROBLEMS.map((p, i) => {
            const delay = 40 + i * 25;
            const localFrame = frame - s.from;
            const cardScale = spring({ frame: Math.max(0, localFrame - delay), fps, config: { damping: 12, stiffness: 100 } });
            const cardOpacity = interpolate(localFrame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            return (
              <div key={i} style={{
                width: 380,
                padding: 32,
                borderRadius: 16,
                border: `1px solid ${COLORS.DANGER}40`,
                backgroundColor: `${COLORS.DANGER}08`,
                opacity: cardOpacity,
                transform: `scale(${cardScale})`,
                display: "flex",
                alignItems: "center",
                gap: 20,
              }}>
                <span style={{ fontSize: 36 }}>{p.icon}</span>
                <span style={{ fontSize: 18, color: COLORS.TEXT_SECONDARY, lineHeight: 1.4 }}>{p.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Sequence>
  );
}
