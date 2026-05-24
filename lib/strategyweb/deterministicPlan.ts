import type { z } from "zod";
import type { ProfileSchema } from "./validate";
import type {
  ActionNode,
  PillarStatus,
  RouteStatus,
  StrategicPillar,
  StrategyPlan,
} from "./types";

type Profile = z.infer<typeof ProfileSchema>;

type Track =
  | "software"
  | "medicine"
  | "finance"
  | "consulting"
  | "startup"
  | "research"
  | "design"
  | "generic";

const KEYWORD_TRACKS: Array<{ track: Track; re: RegExp }> = [
  { track: "software", re: /\b(software|swe|developer|engineer|coding|leetcode|github|cs|computer science)\b/i },
  { track: "medicine", re: /\b(med ?school|premed|medicine|mcat|doctor|clinical)\b/i },
  { track: "finance", re: /\b(finance|investment banking|ib|trading|quant|hedge fund)\b/i },
  { track: "consulting", re: /\b(consulting|mckinsey|bain|bcg|management consult)\b/i },
  { track: "startup", re: /\b(startup|founder|launch|yc|incubator|build a company)\b/i },
  { track: "research", re: /\b(research|phd|grad school|academia|publication)\b/i },
  { track: "design", re: /\b(design|ux|product designer|figma)\b/i },
];

function detectTrack(profile: Profile): Track {
  const haystack = `${profile.targetGoal} ${profile.degree} ${profile.brainDump}`;
  for (const { track, re } of KEYWORD_TRACKS) {
    if (re.test(haystack)) return track;
  }
  return "generic";
}

type PillarTemplate = {
  name: string;
  reason: string;
  weakReason?: string;
  status: PillarStatus;
  actions: Array<Omit<ActionNode, "id"> & { idSlug: string }>;
};

const TRACK_PILLARS: Record<Track, PillarTemplate[]> = {
  software: [
    {
      name: "Skill Signal",
      status: "Weak",
      reason:
        "Recruiters open the link in your resume. If it is empty or unfinished, you are eliminated before the screen.",
      actions: [
        {
          idSlug: "ship-project",
          name: "Ship one portfolio project",
          status: "At Risk",
          recommendation:
            "Pick one realistic project and finish it end-to-end. One shipped beats two half-built.",
        },
        {
          idSlug: "github",
          name: "Daily GitHub activity",
          status: "Behind",
          recommendation:
            "Push small commits every day. An empty graph reads as 'nothing to evaluate.'",
        },
        {
          idSlug: "readme",
          name: "Project README + demo",
          status: "Behind",
          recommendation:
            "Five paragraphs: what it is, how it works, what you'd add next. Link a 60-second demo.",
        },
      ],
    },
    {
      name: "Interview Readiness",
      status: "Missing",
      reason:
        "Coding interviews look impossible only because of practice debt. Volume + spaced reps closes the gap.",
      actions: [
        {
          idSlug: "dsa-warmup",
          name: "DSA warm-up",
          status: "At Risk",
          recommendation:
            "Six easy LeetCode problems this week. Build the habit before the volume.",
        },
        {
          idSlug: "mock-interviews",
          name: "Mock interviews",
          status: "Deferred",
          recommendation:
            "Defer until you have ~30 problems solved. Premature mocks reinforce bad habits.",
        },
      ],
    },
    {
      name: "Recruiting",
      status: "Okay",
      reason:
        "Internship slots fill on a clock. Volume + targeted referrals beat a polished cover letter spree.",
      actions: [
        {
          idSlug: "applications",
          name: "5 applications / week",
          status: "Behind",
          recommendation:
            "Five focused applications per week. Apply through referrals where possible.",
        },
        {
          idSlug: "tracker",
          name: "Application tracker",
          status: "On Track",
          recommendation:
            "Keep a one-tab tracker. Followups beat new applications most weeks.",
        },
      ],
    },
    {
      name: "Network",
      status: "Okay",
      reason:
        "One referral is worth twenty cold applications. Coffee chats compound; cold posting does not.",
      actions: [
        {
          idSlug: "coffee-chats",
          name: "Two coffee chats / week",
          status: "Behind",
          recommendation:
            "Message two upper-year students or alumni each week. Ask for advice, not a job.",
        },
      ],
    },
    {
      name: "Academics",
      status: "Strong",
      reason:
        "Your GPA is not the bottleneck. Maintain - do not over-invest above what gets you the cs job.",
      actions: [
        {
          idSlug: "relevant-courses",
          name: "Keep relevant courses on track",
          status: "On Track",
          recommendation:
            "Algorithms / DB / OS are the highest-signal courses. Anchor your week around those.",
        },
      ],
    },
  ],
  medicine: [
    {
      name: "Academic Signal",
      status: "Strong",
      reason: "GPA + course rigor is the foundational filter. Stay above the cut.",
      actions: [
        {
          idSlug: "anchor-gpa",
          name: "Protect GPA in target courses",
          status: "On Track",
          recommendation: "Anchor weekly study around bio/chem. Drop anything that risks GPA.",
        },
      ],
    },
    {
      name: "MCAT Track",
      status: "Weak",
      reason:
        "MCAT timing is a 6-month plan. Slipping a month here cascades.",
      actions: [
        {
          idSlug: "mcat-diagnostic",
          name: "MCAT diagnostic + plan",
          status: "At Risk",
          recommendation:
            "Take one timed diagnostic. Build a 6-month plan keyed to weak sections.",
        },
        {
          idSlug: "weekly-cars",
          name: "Daily CARS practice",
          status: "Behind",
          recommendation:
            "CARS only improves with daily reps. 30 minutes per day, no exceptions.",
        },
      ],
    },
    {
      name: "Clinical Hours",
      status: "Weak",
      reason: "Adcoms look for sustained, recent clinical exposure.",
      actions: [
        {
          idSlug: "shadow",
          name: "Shadow 1 physician this month",
          status: "Behind",
          recommendation:
            "Email 5 physicians this week. Shadow hours need to be steady, not panicked.",
        },
      ],
    },
    {
      name: "Service / Volunteering",
      status: "Okay",
      reason: "Show sustained commitment, not breadth across causes.",
      actions: [
        {
          idSlug: "service",
          name: "Stick with one service",
          status: "On Track",
          recommendation:
            "Drop second commitments. Depth in one beats breadth across three.",
        },
      ],
    },
    {
      name: "Research",
      status: "Missing",
      reason:
        "Research is differentiator-level, not requirement-level. Late but valuable.",
      actions: [
        {
          idSlug: "research-pi",
          name: "Email 3 PIs this week",
          status: "Behind",
          recommendation:
            "Read their last paper. Send a 6-line email proposing a 5h/wk role.",
        },
      ],
    },
  ],
  finance: [
    {
      name: "Technicals",
      status: "Weak",
      reason: "First-round screens are technical. Mock until reflex.",
      actions: [
        {
          idSlug: "bview-prep",
          name: "Daily technical drills",
          status: "At Risk",
          recommendation: "30 minutes/day on the standard 400 questions.",
        },
      ],
    },
    {
      name: "Networking",
      status: "Weak",
      reason: "Banking is a coffee chat business. Volume of warm intros matters.",
      actions: [
        {
          idSlug: "alumni-outreach",
          name: "5 alumni emails / week",
          status: "Behind",
          recommendation:
            "Short, specific, school-affiliated emails. Ask for 15-minute calls.",
        },
      ],
    },
    {
      name: "Recruiting Pipeline",
      status: "Okay",
      reason: "Most analyst seats fill earlier than students expect.",
      actions: [
        {
          idSlug: "list",
          name: "Build target firm list",
          status: "On Track",
          recommendation:
            "20 firms tiered into A/B/C. Application timing is more important than coverage.",
        },
      ],
    },
    {
      name: "Academics",
      status: "Strong",
      reason: "GPA is the screen-out. Hold or improve.",
      actions: [
        {
          idSlug: "courses",
          name: "Keep finance / accounting on track",
          status: "On Track",
          recommendation:
            "Anchor study time on finance/accounting/stat. Drop electives that conflict.",
        },
      ],
    },
    {
      name: "Signal",
      status: "Weak",
      reason:
        "Clubs + a deal/markets POV separate you from the GPA-only stack.",
      actions: [
        {
          idSlug: "finance-club",
          name: "Finance club leadership track",
          status: "Behind",
          recommendation:
            "Join one finance club. Aim for a sector / coverage role this term.",
        },
      ],
    },
  ],
  consulting: [
    {
      name: "Case Prep",
      status: "Weak",
      reason: "Case interviews are pattern recognition with practice.",
      actions: [
        {
          idSlug: "case-prep",
          name: "Case partner + 3 cases / week",
          status: "At Risk",
          recommendation: "Pair up and run cases on a steady cadence.",
        },
      ],
    },
    {
      name: "Story / Resume",
      status: "Weak",
      reason: "Consulting resumes use STAR-tight wording.",
      actions: [
        {
          idSlug: "story",
          name: "Build behavioral story bank",
          status: "Behind",
          recommendation: "Write 8 STAR stories. Map to leadership / impact / failure.",
        },
      ],
    },
    {
      name: "Network",
      status: "Okay",
      reason: "Coffee chats beat the formal pipeline.",
      actions: [
        {
          idSlug: "alumni",
          name: "3 alumni chats / week",
          status: "Behind",
          recommendation: "Ask the people who already do the job.",
        },
      ],
    },
    {
      name: "Academics",
      status: "Strong",
      reason: "GPA is the first filter. Maintain.",
      actions: [
        {
          idSlug: "gpa",
          name: "Hold GPA",
          status: "On Track",
          recommendation: "No course-load heroics this semester.",
        },
      ],
    },
    {
      name: "Leadership Signal",
      status: "Weak",
      reason: "Consulting wants concrete leadership artifacts.",
      actions: [
        {
          idSlug: "lead",
          name: "Lead one student org initiative",
          status: "Behind",
          recommendation: "Pick one and ship a visible outcome by month 3.",
        },
      ],
    },
  ],
  startup: [
    {
      name: "Builder Output",
      status: "Weak",
      reason: "Founders ship. Talk is cheap; tweet less, build more.",
      actions: [
        {
          idSlug: "mvp",
          name: "Ship one MVP this semester",
          status: "At Risk",
          recommendation: "Pick one painful problem and ship a thin v1 in 6 weeks.",
        },
      ],
    },
    {
      name: "Distribution",
      status: "Missing",
      reason: "Build with one channel in mind, not five.",
      actions: [
        {
          idSlug: "channel",
          name: "Pick one channel",
          status: "Behind",
          recommendation: "Choose one acquisition channel and test 3 angles before pivoting.",
        },
      ],
    },
    {
      name: "User Conversations",
      status: "Weak",
      reason: "Most early founders don't talk to users enough.",
      actions: [
        {
          idSlug: "user-interviews",
          name: "5 user interviews / week",
          status: "Behind",
          recommendation: "30-minute calls. Specific problem questions, not 'do you like it'.",
        },
      ],
    },
    {
      name: "Cash / Runway",
      status: "Okay",
      reason: "Don't run out of resilience while you experiment.",
      actions: [
        {
          idSlug: "runway",
          name: "Light-weight finances",
          status: "On Track",
          recommendation: "Track personal runway. Keep 6 months of optionality.",
        },
      ],
    },
    {
      name: "Academics",
      status: "Strong",
      reason: "Don't blow up the GPA backup.",
      actions: [
        {
          idSlug: "school-floor",
          name: "Don't fail courses",
          status: "On Track",
          recommendation: "Minimum effort to stay above the floor. Don't quit school yet.",
        },
      ],
    },
  ],
  research: [
    {
      name: "Lab Placement",
      status: "Weak",
      reason: "Research jobs go to the cold-emailer with a project page.",
      actions: [
        {
          idSlug: "lab-emails",
          name: "Email 5 PIs this week",
          status: "At Risk",
          recommendation: "Read their last paper. Propose a small specific project.",
        },
      ],
    },
    {
      name: "Skill Stack",
      status: "Okay",
      reason: "Build the methods stack early.",
      actions: [
        {
          idSlug: "methods",
          name: "Stats / methods practice",
          status: "On Track",
          recommendation: "Pair coursework with one methods textbook this semester.",
        },
      ],
    },
    {
      name: "Output",
      status: "Weak",
      reason:
        "Public artifacts compound. Write something every quarter.",
      actions: [
        {
          idSlug: "writeup",
          name: "Publish one paper / writeup",
          status: "Behind",
          recommendation: "Even a blog post counts. One readable artifact this term.",
        },
      ],
    },
    {
      name: "GPA",
      status: "Strong",
      reason: "Grad apps screen on GPA. Maintain.",
      actions: [
        {
          idSlug: "gpa",
          name: "Hold GPA above bar",
          status: "On Track",
          recommendation: "Don't trade GPA for research hours yet.",
        },
      ],
    },
    {
      name: "Network",
      status: "Okay",
      reason: "Conferences + mailing lists open doors.",
      actions: [
        {
          idSlug: "conf",
          name: "Attend 1 conference / talk series",
          status: "Behind",
          recommendation: "Even virtual. Submit a poster if possible.",
        },
      ],
    },
  ],
  design: [
    {
      name: "Portfolio",
      status: "Weak",
      reason: "Hiring managers open the portfolio in 5 seconds.",
      actions: [
        {
          idSlug: "case-studies",
          name: "Two strong case studies",
          status: "At Risk",
          recommendation: "Pick 2 projects and rewrite them as case studies with process, not screenshots.",
        },
      ],
    },
    {
      name: "Craft",
      status: "Okay",
      reason: "Practice motion / interaction craft weekly.",
      actions: [
        {
          idSlug: "craft",
          name: "Weekly craft session",
          status: "On Track",
          recommendation: "1 small interaction prototype per week.",
        },
      ],
    },
    {
      name: "Network",
      status: "Weak",
      reason: "Design hiring is referral-heavy.",
      actions: [
        {
          idSlug: "design-chats",
          name: "Coffee chats with designers",
          status: "Behind",
          recommendation: "Two designers per week. Ask about how they actually got hired.",
        },
      ],
    },
    {
      name: "Recruiting",
      status: "Okay",
      reason: "Roles cluster; aim 5-10 per week applied.",
      actions: [
        {
          idSlug: "apply",
          name: "5 thoughtful applications / week",
          status: "Behind",
          recommendation: "Tailor cover lines to portfolio links.",
        },
      ],
    },
    {
      name: "Academics",
      status: "Strong",
      reason: "GPA is real but not the lever for design.",
      actions: [
        {
          idSlug: "gpa-design",
          name: "Hold GPA, prioritize craft",
          status: "On Track",
          recommendation: "Don't trade portfolio time for GPA chasing.",
        },
      ],
    },
  ],
  generic: [
    {
      name: "Skill Signal",
      status: "Weak",
      reason: "Recruiters need something concrete to evaluate.",
      actions: [
        {
          idSlug: "artifact",
          name: "Ship one public artifact",
          status: "At Risk",
          recommendation: "Pick one project / writeup / portfolio piece and finish it.",
        },
      ],
    },
    {
      name: "Recruiting",
      status: "Okay",
      reason: "Volume and timing both matter.",
      actions: [
        {
          idSlug: "apply",
          name: "5 applications / week",
          status: "Behind",
          recommendation: "Pick a steady weekly cadence.",
        },
      ],
    },
    {
      name: "Network",
      status: "Okay",
      reason: "One referral beats twenty cold emails.",
      actions: [
        {
          idSlug: "chats",
          name: "Two coffee chats / week",
          status: "Behind",
          recommendation: "Ask for 15 minutes. Send a follow-up note.",
        },
      ],
    },
    {
      name: "Academics",
      status: "Strong",
      reason: "Don't blow up your floor.",
      actions: [
        {
          idSlug: "courses",
          name: "Keep courses on track",
          status: "On Track",
          recommendation: "Anchor your week around the highest-signal class.",
        },
      ],
    },
    {
      name: "Focus",
      status: "Weak",
      reason: "Too many commitments dilute output. Cut what you can.",
      actions: [
        {
          idSlug: "cut",
          name: "Identify what to cut",
          status: "Behind",
          recommendation: "List your 5 weekly commitments. Cut the bottom 2.",
        },
      ],
    },
  ],
};

function detectBottleneck(profile: Profile, track: Track): string {
  const dump = profile.brainDump.toLowerCase();
  if (track === "software") {
    if (/empty github|no project|nothing shipped|haven'?t shipped/.test(dump))
      return "No shipped project - GitHub is empty";
    if (/leetcode|interview/.test(dump))
      return "Coding interviews - DSA practice debt";
    if (/applications|applying|recruit/.test(dump))
      return "Application volume too low for the season";
  }
  if (track === "medicine") {
    if (/mcat/.test(dump)) return "MCAT plan not committed";
    if (/shadow|clinical/.test(dump))
      return "Clinical hours are too low";
  }
  if (track === "finance") return "Networking & technicals not started";
  if (track === "consulting") return "Case prep not on a steady cadence";
  if (track === "startup") return "No shipped MVP yet";
  if (/scattered|too many|burnout|overcommit/.test(dump))
    return "Too many parallel commitments";
  return "Strategy is unclear - too many parallel commitments";
}

function detectStage(profile: Profile, track: Track): string {
  if (track === "software") return "Skill Signal";
  if (track === "medicine") return "Pre-MCAT";
  if (track === "finance") return "Networking";
  if (track === "consulting") return "Case Prep";
  if (track === "startup") return "Build";
  if (track === "research") return "Lab Placement";
  if (track === "design") return "Portfolio Build";
  return "Setup";
}

function buildPillars(planId: string, track: Track): StrategicPillar[] {
  const templates = TRACK_PILLARS[track];
  return templates.map((t, pi) => ({
    id: `${planId}-pillar-${pi}`,
    name: t.name,
    status: t.status,
    reason: t.reason,
    actions: t.actions.map((a, ai) => ({
      id: `${planId}-action-${pi}-${ai}-${a.idSlug}`,
      name: a.name,
      status: a.status,
      recommendation: a.recommendation,
    })),
  }));
}

function pickPriorities(track: Track, goal: string): string[] {
  const base: Record<Track, string[]> = {
    software: [
      "Ship one complete portfolio project",
      "Build daily LeetCode habit (6 / week minimum)",
      "Send 5 internship applications per week",
      "Message 2 upper-year students for coffee chats",
      "Cap non-goal activities at 3 hours per week",
    ],
    medicine: [
      "Lock the MCAT timeline + study plan",
      "10 sustained clinical hours per week",
      "Stick with one service commitment",
      "Hold GPA above target in bio/chem",
      "Cap optional clubs at 2 hours / week",
    ],
    finance: [
      "Daily technical drilling",
      "5 alumni emails / week",
      "Build a tiered firm target list",
      "Hold GPA at target",
      "Get a sector role in the finance club",
    ],
    consulting: [
      "3 cases / week with a partner",
      "Build 8 STAR stories",
      "3 coffee chats / week",
      "Lead one student org initiative",
      "Hold GPA",
    ],
    startup: [
      "Ship one v1 in 6 weeks",
      "Pick one acquisition channel + test 3 angles",
      "5 user interviews / week",
      "Track personal runway monthly",
      "Stay above the school floor",
    ],
    research: [
      "Email 5 PIs this week",
      "Pair coursework with methods practice",
      "Publish one writeup this term",
      "Hold GPA above grad-school bar",
      "Attend 1 conference / talk series",
    ],
    design: [
      "Rewrite 2 case studies in process form",
      "Weekly craft prototype",
      "2 designer coffee chats / week",
      "5 tailored applications / week",
      "Hold GPA without sacrificing craft",
    ],
    generic: [
      "Pick one anchor and stop diluting",
      "Build a steady weekly cadence",
      "Cut the bottom 2 commitments",
      "Hold academics at floor",
      "Two coffee chats / week",
    ],
  };
  const list = [...base[track]];
  if (goal && list.length < 5) list.push(`Stay aligned with: ${goal}`);
  return list.slice(0, 5);
}

function pickCuts(track: Track, profile: Profile) {
  const all = profile.commitments.length
    ? profile.commitments
    : ["Generic club", "Side project", "Extra course load"];
  return [
    {
      id: "cut-extra-clubs",
      activity: "Joining another generic club",
      recommendation: "Cut" as const,
      reason:
        "Generic clubs add zero signal for your target. Time pulled is time lost from the bottleneck.",
    },
    {
      id: "cut-second-project",
      activity: "A second side project before the first ships",
      recommendation: "Cut" as const,
      reason:
        "Two half-built projects are weaker than one finished one. Finish the first.",
    },
    {
      id: "cut-research-defer",
      activity: "Adding research this semester",
      recommendation: "Defer" as const,
      reason:
        "Strong long-term move, wrong timing. Revisit once your bottleneck is unstuck.",
    },
    {
      id: "cut-keep-leadership",
      activity: all[0] ?? "Current leadership role",
      recommendation: "Keep" as const,
      reason:
        "Signal is real, but hard cap to 3 hours per week to protect your anchor.",
    },
    {
      id: "cut-double-down-anchor",
      activity: "The single artifact closest to your goal",
      recommendation: "Double Down" as const,
      reason:
        "This is the lever. Move every spare hour here until it ships.",
    },
  ];
}

function pickNext7(track: Track): StrategyPlan["nextSevenDays"] {
  const map: Record<Track, StrategyPlan["nextSevenDays"]> = {
    software: [
      { id: "n7-1", title: "Pick one project and commit to finishing it this month", category: "Skill Signal", priority: "High" },
      { id: "n7-2", title: "Push current project progress to GitHub today", category: "Skill Signal", priority: "High" },
      { id: "n7-3", title: "Write a README that explains what the project does", category: "Skill Signal", priority: "High" },
      { id: "n7-4", title: "Solve 6 easy LeetCode problems", category: "Interview Readiness", priority: "High" },
      { id: "n7-5", title: "Send 5 internship applications", category: "Recruiting", priority: "Medium" },
      { id: "n7-6", title: "Message 2 upper-year CS students for coffee", category: "Network", priority: "Medium" },
    ],
    medicine: [
      { id: "n7-1", title: "Take one timed MCAT diagnostic", category: "MCAT Track", priority: "High" },
      { id: "n7-2", title: "30 minutes of CARS practice daily", category: "MCAT Track", priority: "High" },
      { id: "n7-3", title: "Email 5 physicians about shadowing", category: "Clinical Hours", priority: "Medium" },
      { id: "n7-4", title: "Drop second service commitment", category: "Service / Volunteering", priority: "Medium" },
      { id: "n7-5", title: "Email 3 PIs about research", category: "Research", priority: "Low" },
    ],
    finance: [
      { id: "n7-1", title: "30 minutes of technical drills daily", category: "Technicals", priority: "High" },
      { id: "n7-2", title: "Send 5 alumni outreach emails", category: "Networking", priority: "High" },
      { id: "n7-3", title: "Build target firm list (20 firms)", category: "Recruiting Pipeline", priority: "Medium" },
      { id: "n7-4", title: "Apply for finance club sector role", category: "Signal", priority: "Medium" },
    ],
    consulting: [
      { id: "n7-1", title: "3 case interviews with partner", category: "Case Prep", priority: "High" },
      { id: "n7-2", title: "Write 4 STAR stories", category: "Story / Resume", priority: "High" },
      { id: "n7-3", title: "Set up 3 alumni chats", category: "Network", priority: "Medium" },
      { id: "n7-4", title: "Propose one initiative in your student org", category: "Leadership Signal", priority: "Medium" },
    ],
    startup: [
      { id: "n7-1", title: "Define the v1 you'll ship in 6 weeks", category: "Builder Output", priority: "High" },
      { id: "n7-2", title: "5 user interviews this week", category: "User Conversations", priority: "High" },
      { id: "n7-3", title: "Pick one acquisition channel for testing", category: "Distribution", priority: "Medium" },
    ],
    research: [
      { id: "n7-1", title: "Email 5 PIs with a specific small project", category: "Lab Placement", priority: "High" },
      { id: "n7-2", title: "Read 2 papers from a target lab", category: "Skill Stack", priority: "Medium" },
      { id: "n7-3", title: "Start a public writeup of your last project", category: "Output", priority: "Medium" },
    ],
    design: [
      { id: "n7-1", title: "Rewrite one case study as a process narrative", category: "Portfolio", priority: "High" },
      { id: "n7-2", title: "One micro-interaction prototype", category: "Craft", priority: "Medium" },
      { id: "n7-3", title: "Coffee chat with 2 designers", category: "Network", priority: "Medium" },
      { id: "n7-4", title: "Send 5 tailored applications", category: "Recruiting", priority: "Medium" },
    ],
    generic: [
      { id: "n7-1", title: "Identify your one anchor for this term", category: "Focus", priority: "High" },
      { id: "n7-2", title: "Cut your bottom 2 commitments", category: "Focus", priority: "High" },
      { id: "n7-3", title: "Schedule 2 coffee chats", category: "Network", priority: "Medium" },
      { id: "n7-4", title: "Send 5 applications", category: "Recruiting", priority: "Medium" },
    ],
  };
  return map[track];
}

function pickRisks(track: Track): StrategyPlan["risks"] {
  return [
    {
      id: "risk-overcommit",
      title: "Saying yes to more commitments before your anchor ships",
      severity: "High",
      explanation: "Every new yes pushes the anchor back. Your bottleneck gets worse, not better.",
    },
    {
      id: "risk-season",
      title: "Recruiting season closes before your signal is ready",
      severity: "High",
      explanation: "The hiring window is on a clock. Late signal = no interviews.",
    },
    {
      id: "risk-practice-debt",
      title: track === "software"
        ? "DSA gap becomes an interview blocker"
        : "Practice debt becomes an evaluation blocker",
      severity: "Medium",
      explanation: "Without steady reps, you'll fail technical / case screens even with strong artifacts.",
    },
  ];
}

function computeRouteStatus(profile: Profile): RouteStatus {
  const dump = profile.brainDump.toLowerCase();
  if (/scattered|overwhelm|too many/.test(dump)) return "Scattered";
  if (/behind|crisis|panic|urgent/.test(dump)) return "At Risk";
  if (/clear|on track|good/.test(dump)) return "On Track";
  if (profile.commitments.length >= 4) return "Needs Focus";
  return "Scattered";
}

function alignmentScore(profile: Profile, track: Track): number {
  let base = 60;
  if (track !== "generic") base += 6;
  if (profile.workHoursPerWeek > 25) base -= 10;
  if (profile.commitments.length > 4) base -= 5;
  if (profile.brainDump.length > 400) base += 4;
  return Math.max(35, Math.min(85, base));
}

export function buildDeterministicPlan(
  profile: Profile,
  planId: string,
  studentId: string,
): StrategyPlan {
  const track = detectTrack(profile);
  return {
    id: planId,
    studentId,
    destination: profile.targetGoal,
    currentStage: detectStage(profile, track),
    mainBottleneck: detectBottleneck(profile, track),
    routeStatus: computeRouteStatus(profile),
    alignmentScore: alignmentScore(profile, track),
    strategicPillars: buildPillars(planId, track),
    semesterPriorities: pickPriorities(track, profile.targetGoal),
    cutList: pickCuts(track, profile),
    nextSevenDays: pickNext7(track),
    risks: pickRisks(track),
    createdAt: new Date().toISOString(),
  };
}
