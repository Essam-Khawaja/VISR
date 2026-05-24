"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addTasksToNode,
  applyOpportunity,
  loadStoredPlan,
  savePlan,
  setActionState,
  type ActionState,
  type StoredPlan,
} from "@/lib/planStore";
import { DEMO_PLAN_ID, fixturePlan } from "@/lib/fixture";
import type { ActionNode, OpportunityCheck, StrategyPlan } from "@/lib/types";

type PlanContextValue = {
  planId: string;
  plan: StrategyPlan;
  stored: StoredPlan;
  isDemo: boolean;
  isReady: boolean;
  markAction: (actionId: string, state: ActionState) => void;
  addTasks: (
    parentNodeId: string,
    tasks: { name: string; recommendation: string }[],
  ) => void;
  applyOpportunityResult: (check: OpportunityCheck) => void;
  refresh: () => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

type Props = {
  planId: string;
  initialPlan?: StrategyPlan | null;
  children: React.ReactNode;
};

export function PlanProvider({ planId, initialPlan, children }: Props) {
  const isDemo = planId === DEMO_PLAN_ID || planId.startsWith("demo-");
  const [stored, setStored] = useState<StoredPlan | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isDemo) {
      const demoPlan: StrategyPlan = { ...fixturePlan, id: planId };
      setStored({
        plan: demoPlan,
        actionStates: {},
        appliedCuts: [],
        commitments: [],
        journal: [],
        opportunityHistory: [],
        lastReviewedAt: new Date().toISOString(),
      });
      setIsReady(true);
      return;
    }
    const fromStore = loadStoredPlan(planId);
    if (fromStore) {
      setStored(fromStore);
    } else if (initialPlan) {
      savePlan(planId, initialPlan);
      const fresh = loadStoredPlan(planId);
      setStored(fresh);
    } else {
      setStored(null);
    }
    setIsReady(true);
  }, [planId, isDemo, initialPlan]);

  const markAction = useCallback(
    (actionId: string, state: ActionState) => {
      if (isDemo) {
        setStored((prev) => {
          if (!prev) return prev;
          const next = { ...prev.actionStates };
          if (state === "open") delete next[actionId];
          else next[actionId] = state;
          return { ...prev, actionStates: next };
        });
        return;
      }
      const next = setActionState(planId, actionId, state);
      if (next) setStored(next);
    },
    [planId, isDemo],
  );

  const addTasks = useCallback(
    (
      parentNodeId: string,
      tasks: { name: string; recommendation: string }[],
    ) => {
      if (isDemo) {
        setStored((prev) => {
          if (!prev) return prev;
          const created: ActionNode[] = tasks.map((t) => ({
            id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: t.name,
            status: "On Track" as const,
            recommendation: t.recommendation,
          }));
          const plan = JSON.parse(JSON.stringify(prev.plan)) as StrategyPlan;
          let attached = false;
          for (const pillar of plan.strategicPillars) {
            if (pillar.id === parentNodeId) {
              pillar.actions.push(...created);
              attached = true;
              break;
            }
            for (const action of pillar.actions) {
              if (attachChildrenDemo(action, parentNodeId, created)) {
                attached = true;
                break;
              }
            }
            if (attached) break;
          }
          return attached ? { ...prev, plan } : prev;
        });
        return;
      }
      addTasksToNode(planId, parentNodeId, tasks);
      const fresh = loadStoredPlan(planId);
      if (fresh) setStored(fresh);
    },
    [planId, isDemo],
  );

  const applyOpportunityResult = useCallback(
    (check: OpportunityCheck) => {
      if (isDemo) {
        setStored((prev) =>
          prev
            ? {
                ...prev,
                opportunityHistory: [check, ...prev.opportunityHistory].slice(
                  0,
                  20,
                ),
              }
            : prev,
        );
        return;
      }
      const next = applyOpportunity(planId, check);
      if (next) setStored(next);
    },
    [planId, isDemo],
  );

  const refresh = useCallback(() => {
    if (isDemo) return;
    const fresh = loadStoredPlan(planId);
    if (fresh) setStored(fresh);
  }, [planId, isDemo]);

  const value: PlanContextValue | null = useMemo(() => {
    if (!stored) return null;
    return {
      planId,
      plan: stored.plan,
      stored,
      isDemo,
      isReady,
      markAction,
      addTasks,
      applyOpportunityResult,
      refresh,
    };
  }, [
    planId,
    stored,
    isDemo,
    isReady,
    markAction,
    addTasks,
    applyOpportunityResult,
    refresh,
  ]);

  return (
    <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
  );
}

function attachChildrenDemo(
  action: ActionNode,
  parentId: string,
  children: ActionNode[],
): boolean {
  if (action.id === parentId) {
    action.children = [...(action.children ?? []), ...children];
    return true;
  }
  if (action.children) {
    for (const child of action.children) {
      if (attachChildrenDemo(child, parentId, children)) return true;
    }
  }
  return false;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error(
      "usePlan must be used inside a PlanProvider with a ready plan",
    );
  }
  return ctx;
}

export function usePlanOptional(): PlanContextValue | null {
  return useContext(PlanContext);
}
