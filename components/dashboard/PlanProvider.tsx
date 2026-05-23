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
  applyOpportunity,
  loadStoredPlan,
  savePlan,
  setActionState,
  type ActionState,
  type StoredPlan,
} from "@/lib/planStore";
import { DEMO_PLAN_ID, fixturePlan } from "@/lib/fixture";
import type { OpportunityCheck, StrategyPlan } from "@/lib/types";

type PlanContextValue = {
  planId: string;
  plan: StrategyPlan;
  stored: StoredPlan;
  isDemo: boolean;
  isReady: boolean;
  markAction: (actionId: string, state: ActionState) => void;
  applyOpportunityResult: (check: OpportunityCheck) => void;
  refresh: () => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

type Props = {
  planId: string;
  /** When provided, used for demo/fallback render until hydration completes. */
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
      // Demo is non-persistent — keep stored in-memory only.
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
      // Hydrate localStorage from initialPlan if route was reached directly.
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
        // demo is non-persistent but state should still reflect in-session
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

  const applyOpportunityResult = useCallback(
    (check: OpportunityCheck) => {
      if (isDemo) {
        // demo: keep result in memory only
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
      applyOpportunityResult,
      refresh,
    };
  }, [
    planId,
    stored,
    isDemo,
    isReady,
    markAction,
    applyOpportunityResult,
    refresh,
  ]);

  return (
    <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
  );
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error("usePlan must be used inside a PlanProvider with a ready plan");
  }
  return ctx;
}

export function usePlanOptional(): PlanContextValue | null {
  return useContext(PlanContext);
}
