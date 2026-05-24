/**
 * app/strategyweb/demo/page.tsx
 *
 * Friendly /strategyweb/demo URL that redirects judges to the canonical
 * demo dashboard. Convenient when sharing a link without remembering the
 * plan id.
 */

import { redirect } from "next/navigation";
import { DEMO_PLAN_ID } from "@/lib/strategyweb/demoData";

export default function DemoPage() {
  redirect(`/strategyweb/dashboard/${DEMO_PLAN_ID}`);
}
