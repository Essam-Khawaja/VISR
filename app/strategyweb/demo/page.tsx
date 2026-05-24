import { redirect } from "next/navigation";
import { DEMO_PLAN_ID } from "@/lib/strategyweb/demoData";

export default function DemoPage() {
  redirect(`/strategyweb/dashboard/${DEMO_PLAN_ID}`);
}
