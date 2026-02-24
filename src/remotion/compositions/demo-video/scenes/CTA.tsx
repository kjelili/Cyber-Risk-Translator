import { Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SCENES, COLORS } from "../constants";

export function CTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = SCENES.CTA;
  const localFrame = frame - s.from;

  const titleOpacity = interpolate(localFrame, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleScale = spring({ frame: localFrame, fps, config: { damping: 12, stiffness: 80 } });
  const subtitleOpacity = interpolate(localFrame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const buttonScale = spring({ frame: Math.max(0, localFrame - 50), fps, config: { damping: 10, stiffness: 100 } });
  const buttonOpacity = interpolate(localFrame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Pulsing glow
  const glowPulse = interpolate(localFrame % 60, [0, 30, 60], [0.3, 0.6, 0.3]);

  return (
    <Sequence from={s.from} durationInFrames={s.duration}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {/* Background glow */}
        <div style={{
          position: "absolute",
          width: 600, height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.ACCENT}${Math.round(glowPulse * 40).toString(16).padStart(2, "0")}, transparent 70%)`,
          filter: "blur(100px)",
        }} />

        {/* Logo */}
        <div style={{
          fontSize: 60, marginBottom: 20,
          opacity: titleOpacity, transform: `scale(${titleScale})`,
        }}>
          🛡️
        </div>

        {/* Title */}
        <div style={{
          fontSize: 52, fontWeight: 700,
          opacity: titleOpacity, transform: `scale(${titleScale})`,
          background: `linear-gradient(135deg, ${COLORS.ACCENT}, ${COLORS.ACCENT_LIGHT})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 16,
        }}>
          Cybersecurity Risk Operation Centre
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 24, color: COLORS.TEXT_SECONDARY,
          opacity: subtitleOpacity, marginBottom: 40,
          textAlign: "center" as const, maxWidth: 600, lineHeight: 1.5,
        }}>
          Unify your security operations. Quantify your risk. Empower your board.
        </div>

        {/* CTA Button */}
        <div style={{
          opacity: buttonOpacity, transform: `scale(${buttonScale})`,
          padding: "18px 48px", borderRadius: 14,
          background: `linear-gradient(135deg, ${COLORS.ACCENT}, ${COLORS.ACCENT_LIGHT})`,
          fontSize: 20, fontWeight: 600,
          boxShadow: `0 8px 30px ${COLORS.ACCENT}40`,
        }}>
          Get Started Today
        </div>

        {/* URL */}
        <div style={{
          marginTop: 30, fontSize: 16, color: COLORS.TEXT_TERTIARY,
          opacity: subtitleOpacity, fontFamily: "monospace",
        }}>
          localhost:5173
        </div>
      </div>
    </Sequence>
  );
}
