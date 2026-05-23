import {
  Laptop,
  Tablet,
  Book,
  BatteryCharging,
  Droplet,
  Dumbbell,
  Apple,
  ShoppingBag,
  Headphones,
  Wallet,
  IdCard,
  Pencil,
  FileText,
  Calculator,
  Cpu,
  Usb,
  SprayCan,
  Files,
  Package,
  Umbrella,
  Snowflake,
  Shirt,
  Coffee,
  Footprints,
  Key,
  Glasses,
  Pill,
  LucideIcon,
} from "lucide-react";

const RULES: Array<{ test: RegExp; icon: LucideIcon }> = [
  { test: /\blaptop\b/i, icon: Laptop },
  { test: /\b(ipad|tablet)\b/i, icon: Tablet },
  { test: /\b(notebook|notepad)\b/i, icon: Book },
  { test: /\b(charger|charging cable|power bank)\b/i, icon: BatteryCharging },
  { test: /\b(water bottle|hydroflask|flask)\b/i, icon: Droplet },
  { test: /\b(gym clothes|workout gear|sportswear)\b/i, icon: Dumbbell },
  { test: /\b(protein|snack|fruit)\b/i, icon: Apple },
  { test: /\b(grocery bag|reusable tote|tote bag|tote)\b/i, icon: ShoppingBag },
  { test: /\bheadphones?\b|\bearbuds\b/i, icon: Headphones },
  { test: /\bwallet\b/i, icon: Wallet },
  { test: /\b(student id|id card|access card)\b/i, icon: IdCard },
  { test: /\bpen(s)?\b|\bpencil\b/i, icon: Pencil },
  { test: /\b(printed assignment|printout|paper|resumes?|documents?)\b/i, icon: FileText },
  { test: /\bcalculator\b/i, icon: Calculator },
  { test: /\b(arduino|raspberry|breadboard|kit|microcontroller|circuit)\b/i, icon: Cpu },
  { test: /\b(usb|flash drive|thumb drive)\b/i, icon: Usb },
  { test: /\b(hand sanitizer|sanitizer|spray)\b/i, icon: SprayCan },
  { test: /\b(folder|binder|files?)\b/i, icon: Files },
  { test: /\bumbrella\b/i, icon: Umbrella },
  { test: /\b(winter|gloves|hat|boots|jacket|coat|scarf)\b/i, icon: Snowflake },
  { test: /\b(shirt|sweater|hoodie|clothes)\b/i, icon: Shirt },
  { test: /\b(coffee|tea|thermos|mug)\b/i, icon: Coffee },
  { test: /\b(shoes|sneakers|trainers|runners)\b/i, icon: Footprints },
  { test: /\bkeys?\b/i, icon: Key },
  { test: /\b(glasses|sunglasses)\b/i, icon: Glasses },
  { test: /\b(meds?|medication|pills?|vitamins?)\b/i, icon: Pill },
];

export function getItemIcon(itemName: string): LucideIcon {
  for (const r of RULES) {
    if (r.test.test(itemName)) return r.icon;
  }
  return Package;
}

export function normalizeItemName(name: string): string {
  return name.trim().toLowerCase();
}
