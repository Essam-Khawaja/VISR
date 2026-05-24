import { redirect } from "next/navigation";
import { DEMO_PLAN_ID } from "@/lib/2/demoData";

export default function DemoPage() {
  redirect(`/2/dashboard/${DEMO_PLAN_ID}`);
}
