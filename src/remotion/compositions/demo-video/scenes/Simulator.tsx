import { Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SCENES, COLORS } from "../constants";

export function Simulator() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = SCENES.SIMULATOR;
  const localFrame = frame - s.from;

  const headingOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(localFrame, [s.duration - 15, s.duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Animated exposure value counting up
  const exposureProgress = interpolate(localFrame, [40, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exposureValue = Math.round(1200000 * exposureProgress);

  // Slider animation
  const sliderProgress = interpolate(localFrame, [30, 100], [0.1, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const drivers = [
    { name: "Downtime", value: Math.round(400000 * exposureProgress), color: COLORS.DANGER },
    { name: "Regulatory", value: Math.round(500000 * exposureProgress), color: COLORS.WARNING },
    { name: "Legal/IR", value: Math.round(200000 * exposureProgress), color: COLORS.ACCENT },
    { name: "Reputation", value: Math.round(100000 * exposureProgress), color: COLORS.HIGH },
  ];

  return (
    <Sequence from={s.from} durationInFrames={s.duration}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, opacity: exitOpacity }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: COLORS.WARNING, opacity: headingOpacity, marginBottom: 16 }}>
          Impact Simulator
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, opacity: headingOpacity, marginBottom: 40, textAlign: "center" as const }}>
          Quantify Risk in Financial Terms
        </div>

        <div style={{
          width: 900, borderRadius: 20, border: `1px solid ${COLORS.BORDER}`,
          backgroundColor: COLORS.BG_CARD, padding: 40,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}>
          {/* Slider mockup */}
          <div style={{ marginBottom: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: COLORS.TEXT_SECONDARY }}>Downtime (hours)</span>
              <span style={{ color: COLORS.ACCENT, fontWeight: 600 }}>{Math.round(sliderProgress * 240)}h</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.BG_SECONDARY }}>
              <div style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.ACCENT, width: `${sliderProgress * 100}%`, transition: "width 0.1s" }} />
            </div>
          </div>

          {/* Exposure value */}
          <div style={{
            textAlign: "center" as const, padding: 30,
            borderRadius: 16, border: `1px solid ${COLORS.DANGER}40`,
            backgroundColor: `${COLORS.DANGER}08`, marginBottom: 30,
          }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: COLORS.DANGER }}>
              £{exposureValue.toLocaleString()}
            </div>
            <div style={{ fontSize: 14, color: COLORS.TEXT_TERTIARY, marginTop: 8 }}>
              Estimated Financial Exposure
            </div>
          </div>

          {/* Breakdown bars */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {drivers.map((d, i) => {
              const barDelay = 60 + i * 15;
              const barWidth = interpolate(localFrame, [barDelay, barDelay + 30], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ padding: 14, borderRadius: 10, backgroundColor: COLORS.BG_SECONDARY }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: COLORS.TEXT_SECONDARY }}>{d.name}</span>
                    <span style={{ fontWeight: 600 }}>£{d.value.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, backgroundColor: `${d.color}20` }}>
                    <div style={{ height: 4, borderRadius: 2, backgroundColor: d.color, width: `${barWidth}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Sequence>
  );
}
