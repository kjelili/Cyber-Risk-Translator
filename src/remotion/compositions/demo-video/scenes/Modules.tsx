import { Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SCENES, COLORS } from "../constants";

const MODULES = [
  { icon: "🛡️", name: "CROC Dashboard", desc: "Unified risk posture" },
  { icon: "💻", name: "Endpoint Security", desc: "EDR/AV/Patch monitoring" },
  { icon: "✅", name: "Compliance", desc: "ISO27001, SOC2, NIST" },
  { icon: "💳", name: "PCI DSS", desc: "12-requirement tracking" },
  { icon: "☁️", name: "Cloud Security", desc: "AWS, Azure, GCP" },
  { icon: "🔧", name: "DevSecOps", desc: "SAST/DAST/SCA/Container" },
  { icon: "⚡", name: "Threat Protection", desc: "IOCs & Incidents" },
  { icon: "📦", name: "Supply Chain", desc: "SBOM & CVE tracking" },
  { icon: "🇪🇺", name: "NIS2", desc: "EU Directive compliance" },
];

export function Modules() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = SCENES.MODULES;
  const localFrame = frame - s.from;

  const headingOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(localFrame, [s.duration - 20, s.duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <Sequence from={s.from} durationInFrames={s.duration}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, opacity: exitOpacity }}>
        <div style={{
          fontSize: 14, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const,
          color: COLORS.ACCENT, opacity: headingOpacity, marginBottom: 16,
        }}>
          9 Integrated Modules
        </div>

        <div style={{
          fontSize: 40, fontWeight: 700, textAlign: "center" as const,
          opacity: headingOpacity, marginBottom: 50,
        }}>
          Complete Security Coverage
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          maxWidth: 1200,
        }}>
          {MODULES.map((m, i) => {
            const delay = 30 + i * 12;
            const cardScale = spring({ frame: Math.max(0, localFrame - delay), fps, config: { damping: 14, stiffness: 120 } });
            const cardOpacity = interpolate(localFrame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            return (
              <div key={i} style={{
                padding: 28,
                borderRadius: 16,
                border: `1px solid ${COLORS.BORDER}`,
                backgroundColor: COLORS.BG_CARD,
                opacity: cardOpacity,
                transform: `scale(${cardScale})`,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}>
                <span style={{ fontSize: 32 }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.TEXT_PRIMARY }}>{m.name}</div>
                  <div style={{ fontSize: 13, color: COLORS.TEXT_TERTIARY, marginTop: 2 }}>{m.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Sequence>
  );
}
