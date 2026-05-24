import { redirect } from "next/navigation";
import { DEMO_PLAN_ID } from "@/lib/demoData";

export default function DemoPage() {
  redirect(`/dashboard/${DEMO_PLAN_ID}`);
}
