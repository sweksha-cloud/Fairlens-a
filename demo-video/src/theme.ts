import { loadFont as loadMada } from "@remotion/google-fonts/Mada";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// The site's own fonts: Mada for headings (font-display), Inter for UI text.
export const { fontFamily: displayFamily } = loadMada("normal", { weights: ["500", "700"], subsets: ["latin"] });
export const { fontFamily } = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
export const { fontFamily: monoFamily } = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] });

// The site's palette (frontend/src/app/components).
export const C = {
  bg: "#000000",
  panel: "#0d1416",
  card: "#ffffff",
  text: "#ffffff",
  dim: "rgba(255,255,255,.72)",
  faint: "rgba(255,255,255,.14)",
  cyan: "#3CE6DD",
  blue: "#37B1E6",
  ink: "#111111",
  muted: "#6b7280",
  border: "#e5e7eb",
  red: "#EF4444",
  amber: "#F59E0B",
  amberSoft: "#fff7e6",
};

export const FPS = 30;
export const sec = (s: number) => Math.round(s * FPS);
