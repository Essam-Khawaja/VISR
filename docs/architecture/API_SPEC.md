# API SPEC: Pathwise

## Claude Configuration

```typescript
// lib/claude.ts

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function callClaude(prompt: string, systemPrompt: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }]
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");
  return block.text;
}
```

---

## Strategy Generation Prompt

```typescript
// lib/prompts.ts

export function buildStrategyPrompt(profile: StudentProfile): {
  system: string;
  user: string;
} {
  const system = `You are Pathwise, a university strategy advisor. You analyze a student's academic context, career goal, and commitments, then generate a precise strategic plan.

Your output must be a single valid JSON object matching the schema below. Do not include any text before or after the JSON. Do not use markdown code blocks. Output raw JSON only.

Be specific and opinionated. Generic advice is useless. Every bottleneck, recommendation, and action must be tied directly to the student's stated goal. Name specific activities from their profile. Do not hedge.

Schema:
{
  "destination": "string — the student's career goal, restated precisely",
  "currentStage": "string — the current phase of their journey (e.g. Skill Signal, Recruiting, Interview Prep)",
  "mainBottleneck": "string — the single most important thing blocking progress, stated specifically",
  "routeStatus": "On Track" | "At Risk" | "Scattered" | "Needs Focus",
  "alignmentScore": number between 0 and 100,
  "strategicPillars": [
    {
      "id": "string",
      "name": "string",
      "status": "Strong" | "Okay" | "Weak" | "Missing",
      "reason": "string — specific explanation based on their profile",
      "actions": [
        {
          "id": "string",
          "name": "string",
          "status": "On Track" | "Behind" | "At Risk" | "Deferred" | "Cut",
          "recommendation": "string — specific next action"
        }
      ]
    }
  ],
  "semesterPriorities": ["string", ...],
  "cutList": [
    {
      "id": "string",
      "activity": "string — from their actual profile",
      "recommendation": "Cut" | "Defer" | "Keep" | "Double Down",
      "reason": "string — specific to their goal"
    }
  ],
  "nextSevenDays": [
    {
      "id": "string",
      "title": "string — specific action, not generic advice",
      "category": "string",
      "priority": "High" | "Medium" | "Low"
    }
  ],
  "risks": [
    {
      "id": "string",
      "title": "string",
      "severity": "High" | "Medium" | "Low",
      "explanation": "string"
    }
  ]
}

Rules:
- Minimum 4 strategic pillars, maximum 6
- Minimum 3 next seven days actions, maximum 7
- Minimum 2 cut list items
- Minimum 1 risk
- alignmentScore should reflect honest assessment (60-75 is typical for scattered students)
- mainBottleneck must be a single specific thing, not a list
- All IDs should be simple kebab-case strings like "pillar-skill" or "action-github"`;

  const user = `Generate a strategic plan for this student:

University: ${profile.university}
Degree: ${profile.degree}
Year: ${profile.year}
Target Goal: ${profile.targetGoal}
Secondary Goals: ${profile.secondaryGoals.join(", ") || "None stated"}
Current Courses: ${profile.currentCourses.join(", ") || "Not specified"}
Commitments: ${profile.commitments.join(", ") || "None stated"}
Work Hours Per Week: ${profile.workHoursPerWeek}
Constraints: ${profile.constraints.join(", ") || "None stated"}

Brain Dump:
${profile.brainDump}`;

  return { system, user };
}
```

---

## Opportunity Check Prompt

```typescript
export function buildOpportunityPrompt(
  opportunity: string,
  plan: StrategyPlan
): { system: string; user: string } {
  const system = `You are Pathwise, a university strategy advisor. A student is asking whether they should take on a new opportunity. You have their current strategic plan as context.

Output a single valid JSON object. No text before or after. No markdown. Raw JSON only.

Schema:
{
  "fitScore": number between 0 and 100,
  "recommendation": "Say Yes" | "Say No" | "Defer" | "Say Yes With Conditions",
  "reasoning": "string — one clear paragraph explaining the recommendation",
  "whyItFits": ["string", ...],
  "tradeoffs": ["string", ...],
  "conditions": ["string", ...],
  "cutsRequired": ["string", ...]
}

Rules:
- fitScore above 70 suggests yes or yes with conditions
- fitScore below 40 suggests no or defer
- Be opinionated. Do not hedge.
- conditions should only be present if recommendation is "Say Yes With Conditions"
- cutsRequired should name specific activities from their current plan
- If the opportunity directly addresses their mainBottleneck, score it higher`;

  const user = `Student's current strategy:
Destination: ${plan.destination}
Current Stage: ${plan.currentStage}
Main Bottleneck: ${plan.mainBottleneck}
Route Status: ${plan.routeStatus}
Alignment Score: ${plan.alignmentScore}%

Strategic Pillars:
${plan.strategicPillars.map(p => `- ${p.name}: ${p.status} — ${p.reason}`).join("\n")}

Current Commitments (from cut list context):
${plan.cutList.map(c => `- ${c.activity}: ${c.recommendation}`).join("\n")}

New Opportunity:
${opportunity}

Should they say yes to this?`;

  return { system, user };
}
```

---

## Full API Route Implementation

### /app/api/generate/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { callClaude } from "@/lib/claude";
import { buildStrategyPrompt } from "@/lib/prompts";
import { StrategyPlanSchema } from "@/lib/validation";
import { supabase } from "@/lib/supabase";
import type { StudentProfile } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profileData = body.profile as Omit<StudentProfile, "id" | "createdAt">;

    // Save student profile
    const studentId = uuidv4();
    const { error: profileError } = await supabase
      .from("student_profiles")
      .insert({
        id: studentId,
        university: profileData.university,
        degree: profileData.degree,
        year: profileData.year,
        target_goal: profileData.targetGoal,
        secondary_goals: profileData.secondaryGoals,
        current_courses: profileData.currentCourses,
        commitments: profileData.commitments,
        work_hours_per_week: profileData.workHoursPerWeek,
        constraints: profileData.constraints,
        brain_dump: profileData.brainDump
      });

    if (profileError) throw new Error(`Profile save failed: ${profileError.message}`);

    // Generate strategy
    const profile: StudentProfile = {
      ...profileData,
      id: studentId,
      createdAt: new Date().toISOString()
    };

    const { system, user } = buildStrategyPrompt(profile);
    const raw = await callClaude(user, system);

    // Parse and validate
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Claude returned invalid JSON");
    }

    const validated = StrategyPlanSchema.parse(parsed);

    // Save plan
    const planId = uuidv4();
    const { error: planError } = await supabase
      .from("strategy_plans")
      .insert({
        id: planId,
        student_id: studentId,
        destination: validated.destination,
        current_stage: validated.currentStage,
        main_bottleneck: validated.mainBottleneck,
        route_status: validated.routeStatus,
        alignment_score: validated.alignmentScore,
        strategic_pillars: validated.strategicPillars,
        semester_priorities: validated.semesterPriorities,
        cut_list: validated.cutList,
        next_seven_days: validated.nextSevenDays,
        risks: validated.risks
      });

    if (planError) throw new Error(`Plan save failed: ${planError.message}`);

    return NextResponse.json({ planId, studentId });
  } catch (error) {
    console.error("Strategy generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

### /app/api/opportunity/route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { callClaude } from "@/lib/claude";
import { buildOpportunityPrompt } from "@/lib/prompts";
import { OpportunityCheckSchema } from "@/lib/validation";
import { supabase } from "@/lib/supabase";
import type { StrategyPlan } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { planId, opportunityText } = await req.json();

    // Fetch existing plan for context
    const { data: planData, error: fetchError } = await supabase
      .from("strategy_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (fetchError || !planData) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Map snake_case DB columns to camelCase types
    const plan: StrategyPlan = {
      id: planData.id,
      studentId: planData.student_id,
      destination: planData.destination,
      currentStage: planData.current_stage,
      mainBottleneck: planData.main_bottleneck,
      routeStatus: planData.route_status,
      alignmentScore: planData.alignment_score,
      strategicPillars: planData.strategic_pillars,
      semesterPriorities: planData.semester_priorities,
      cutList: planData.cut_list,
      nextSevenDays: planData.next_seven_days,
      risks: planData.risks,
      createdAt: planData.created_at
    };

    const { system, user } = buildOpportunityPrompt(opportunityText, plan);
    const raw = await callClaude(user, system);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Claude returned invalid JSON");
    }

    const validated = OpportunityCheckSchema.parse(parsed);

    // Save check
    const checkId = uuidv4();
    await supabase.from("opportunity_checks").insert({
      id: checkId,
      student_id: plan.studentId,
      plan_id: planId,
      opportunity_text: opportunityText,
      fit_score: validated.fitScore,
      recommendation: validated.recommendation,
      reasoning: validated.reasoning,
      why_it_fits: validated.whyItFits,
      tradeoffs: validated.tradeoffs,
      conditions: validated.conditions,
      cuts_required: validated.cutsRequired
    });

    return NextResponse.json({
      check: {
        id: checkId,
        studentId: plan.studentId,
        planId,
        opportunityText,
        ...validated,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Opportunity check error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```
