import { Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SCENES, COLORS } from "../constants";

export function Intro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = SCENES.INTRO;

  const titleScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subtitleY = interpolate(frame, [30, 50], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [s.duration - 20, s.duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Animated accent glow
  const glowSize = interpolate(frame, [0, 60], [200, 400], { extrapolateRight: "clamp" });

  return (
    <Sequence from={s.from} durationInFrames={s.duration}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: exitOpacity }}>
        {/* Background glow */}
        <div style={{
          position: "absolute",
          width: glowSize,
          height: glowSize,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.ACCENT}30, transparent 70%)`,
          filter: "blur(80px)",
        }} />

        {/* Shield icon */}
        <div style={{
          fontSize: 80,
          marginBottom: 20,
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
        }}>
          🛡️
        </div>

        {/* Title */}
        <div style={{
          fontSize: 72,
          fontWeight: 700,
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          background: `linear-gradient(135deg, ${COLORS.ACCENT}, ${COLORS.ACCENT_LIGHT})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-1px",
        }}>
          Cybersecurity Risk Operation Centre
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 28,
          color: COLORS.TEXT_SECONDARY,
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          marginTop: 16,
          fontWeight: 500,
        }}>
          Enterprise Cyber Risk Management Platform
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 20,
          color: COLORS.TEXT_TERTIARY,
          opacity: taglineOpacity,
          marginTop: 24,
          maxWidth: 700,
          textAlign: "center",
          lineHeight: 1.6,
        }}>
          Translate technical vulnerabilities into board-ready business intelligence
        </div>
      </div>
    </Sequence>
  );
}
