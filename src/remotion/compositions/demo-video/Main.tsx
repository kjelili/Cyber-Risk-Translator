import { AbsoluteFill } from "remotion";
import { Intro } from "./scenes/Intro";
import { Problem } from "./scenes/Problem";
import { Solution } from "./scenes/Solution";
import { Modules } from "./scenes/Modules";
import { Dashboard } from "./scenes/Dashboard";
import { Simulator } from "./scenes/Simulator";
import { CTA } from "./scenes/CTA";
import { COLORS, Z_INDEX } from "./constants";

export function DemoVideoMain() {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.BG_PRIMARY,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: COLORS.TEXT_PRIMARY,
        overflow: "hidden",
      }}
    >
      {/* Subtle background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: Z_INDEX.BACKGROUND,
          backgroundImage: `
            linear-gradient(${COLORS.BORDER}22 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.BORDER}22 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Scenes */}
      <Intro />
      <Problem />
      <Solution />
      <Modules />
      <Dashboard />
      <Simulator />
      <CTA />
    </AbsoluteFill>
  );
}
