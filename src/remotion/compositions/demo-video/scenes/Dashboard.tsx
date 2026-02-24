import { Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SCENES, COLORS } from "../constants";

const FINDINGS = [
  { sev: "CRITICAL", title: "Broken Access Control", asset: "api.prod", cvss: "9.1", color: COLORS.CRITICAL },
  { sev: "HIGH", title: "SQL Injection", asset: "web.prod", cvss: "8.5", color: COLORS.HIGH },
  { sev: "MEDIUM", title: "Missing Security Headers", asset: "web.stage", cvss: "5.3", color: COLORS.MEDIUM },
  { sev: "LOW", title: "Outdated TLS Version", asset: "api.staging", cvss: "3.7", color: COLORS.LOW },
];

export function Dashboard() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = SCENES.DASHBOARD;
  const localFrame = frame - s.from;

  const headingOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = interpolate(localFrame, [s.duration - 15, s.duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <Sequence from={s.from} durationInFrames={s.duration}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, opacity: exitOpacity }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" as const, color: COLORS.ACCENT, opacity: headingOpacity, marginBottom: 16 }}>
          Risk Assessment
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, opacity: headingOpacity, marginBottom: 40 }}>
          Technical to Executive Translation
        </div>

        {/* Mock dashboard */}
        <div style={{
          width: 1100, borderRadius: 20, border: `1px solid ${COLORS.BORDER}`,
          backgroundColor: COLORS.BG_CARD, overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}>
          {/* Header bar */}
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${COLORS.BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: COLORS.DANGER }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: COLORS.WARNING }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: COLORS.SUCCESS }} />
            <span style={{ marginLeft: 12, fontSize: 14, color: COLORS.TEXT_TERTIARY }}>Cybersecurity Risk Operation Centre</span>
          </div>

          {/* Findings table */}
          <div style={{ padding: 24 }}>
            <div style={{ display: "flex", padding: "12px 0", borderBottom: `2px solid ${COLORS.BORDER}`, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const, color: COLORS.TEXT_TERTIARY }}>
              <div style={{ width: 120 }}>Severity</div>
              <div style={{ flex: 1 }}>Finding</div>
              <div style={{ width: 120 }}>Asset</div>
              <div style={{ width: 80 }}>CVSS</div>
            </div>
            {FINDINGS.map((f, i) => {
              const delay = 30 + i * 15;
              const rowOpacity = interpolate(localFrame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const rowX = interpolate(localFrame, [delay, delay + 10], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

              return (
                <div key={i} style={{
                  display: "flex", padding: "14px 0", borderBottom: `1px solid ${COLORS.BORDER}`,
                  fontSize: 15, opacity: rowOpacity, transform: `translateX(${rowX}px)`,
                  alignItems: "center",
                }}>
                  <div style={{ width: 120 }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                      backgroundColor: `${f.color}20`, color: f.color, border: `1px solid ${f.color}40`,
                    }}>
                      {f.sev}
                    </span>
                  </div>
                  <div style={{ flex: 1, fontWeight: 500 }}>{f.title}</div>
                  <div style={{ width: 120, color: COLORS.TEXT_TERTIARY, fontFamily: "monospace" }}>{f.asset}</div>
                  <div style={{ width: 80, fontWeight: 600 }}>{f.cvss}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Sequence>
  );
}
