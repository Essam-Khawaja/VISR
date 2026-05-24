/**
 * Tiny `clsx` wrapper used everywhere in the UI to compose conditional
 * Tailwind class lists without pulling in a heavier helper. Kept as a named
 * export so it can be tree-shaken in components that prefer raw strings.
 */
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
