export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Total duration: ~60 seconds
export const DURATION = FPS * 60;

// Scene timings (in frames)
export const SCENES = {
  INTRO:     { from: 0,    duration: FPS * 8  },  // 0-8s
  PROBLEM:   { from: FPS * 8,   duration: FPS * 8  },  // 8-16s
  SOLUTION:  { from: FPS * 16,  duration: FPS * 6  },  // 16-22s
  MODULES:   { from: FPS * 22,  duration: FPS * 14 },  // 22-36s
  DASHBOARD: { from: FPS * 36,  duration: FPS * 8  },  // 36-44s
  SIMULATOR: { from: FPS * 44,  duration: FPS * 8  },  // 44-52s
  CTA:       { from: FPS * 52,  duration: FPS * 8  },  // 52-60s
} as const;

// Colors matching the app's design system
export const COLORS = {
  BG_PRIMARY: "#0a0e14",
  BG_SECONDARY: "#111824",
  BG_CARD: "#151b26",
  BORDER: "#1d2a3a",
  TEXT_PRIMARY: "#e8eef6",
  TEXT_SECONDARY: "#a8b3c4",
  TEXT_TERTIARY: "#6b7a8f",
  ACCENT: "#3b82f6",
  ACCENT_LIGHT: "#60a5fa",
  SUCCESS: "#10b981",
  WARNING: "#f59e0b",
  DANGER: "#ef4444",
  CRITICAL: "#dc2626",
  HIGH: "#ea580c",
  MEDIUM: "#f59e0b",
  LOW: "#3b82f6",
} as const;

export const Z_INDEX = {
  BACKGROUND: 0,
  CONTENT: 10,
  OVERLAY: 50,
  HUD: 80,
} as const;
