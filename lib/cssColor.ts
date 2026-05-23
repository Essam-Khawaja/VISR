/** Resolve a CSS variable to a hex color string (browser only). */
export function cssVar(name: string, fallback = "#4facfe"): string {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (!raw) return fallback;
  if (raw.startsWith("#")) return raw;
  return fallback;
}

export function hexToThreeColor(hex: string): number {
  const h = hex.replace("#", "");
  return parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
}
