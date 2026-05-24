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
  fetchStoredPlanFromSupabase,
  loadStoredPlan,
  migrateLocalToSupabase,
  savePlan,
  setActionState,
  type ActionState,
  type StoredPlan,
} from "@/lib/2/planStore";
import {
  computeNodeRollup,
  createStrategyTask,
  type CreateStrategyTaskInput,
  ensureMaterializedTasks,
  fetchTasksFromSupabase,
  migrateActionStatesToTasks,
  type NodeRollup,
  todayLocalDate,
  type UpdateStrategyTaskInput,
  updateStrategyTask,
} from "@/lib/2/taskStore";
import { DEMO_PLAN_ID, fixturePlan } from "@/lib/2/fixture";
import type {
  OpportunityCheck,
  StrategyPlan,
  StrategyTask,
  StrategyTaskStatus,
} from "@/lib/2/types";

type PlanContextValue = {
  planId: string;
  plan: StrategyPlan;
  stored: StoredPlan;
  tasks: StrategyTask[];
  rollups: Record<string, NodeRollup>;
  isDemo: boolean;
  isReady: boolean;
  markAction: (actionId: string, state: ActionState) => void;
  createTask: (input: Omit<CreateStrategyTaskInput, "planId">) => Promise<void>;
  updateTask: (
    taskId: string,
    patch: UpdateStrategyTaskInput,
  ) => Promise<void>;
  markTask: (taskId: string, state: StrategyTaskStatus) => Promise<void>;
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
  const [tasks, setTasks] = useState<StrategyTask[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
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
      setTasks(ensureMaterializedTasks(demoPlan));
      setIsReady(true);
      return;
    }

    // 1) Optimistic paint from localStorage cache.
    const fromCache = loadStoredPlan(planId);
    if (fromCache) {
      setStored(fromCache);
      ensureMaterializedTasks(fromCache.plan);
      setTasks(migrateActionStatesToTasks(planId, fromCache.actionStates));
    } else if (initialPlan) {
      savePlan(planId, initialPlan);
      const fresh = loadStoredPlan(planId);
      setStored(fresh);
      setTasks(ensureMaterializedTasks(initialPlan));
    } else {
      setStored(null);
    }
    setIsReady(true);

    // 2) Background-hydrate from Supabase (source of truth).
    (async () => {
      const fromSupabase = await fetchStoredPlanFromSupabase(planId);
      if (cancelled) return;
      if (fromSupabase) {
        setStored(fromSupabase);
        ensureMaterializedTasks(fromSupabase.plan);
        setTasks(migrateActionStatesToTasks(planId, fromSupabase.actionStates));
      }
    })();

    void fetchTasksFromSupabase({ planId }).then((fromTasks) => {
      if (!cancelled && fromTasks.length > 0) setTasks(fromTasks);
    });

    // 3) One-time push of any leftover local-only plans up to Supabase.
    void migrateLocalToSupabase();

    return () => {
      cancelled = true;
    };
  }, [planId, isDemo, initialPlan]);

  const refreshTasks = useCallback(async () => {
    const fromTasks = await fetchTasksFromSupabase({ planId });
    setTasks(fromTasks);
  }, [planId]);

  const createTask = useCallback(
    async (input: Omit<CreateStrategyTaskInput, "planId">) => {
      const task = await createStrategyTask({ ...input, planId });
      setTasks((prev) => [...prev.filter((t) => t.id !== task.id), task]);
    },
    [planId],
  );

  const updateTask = useCallback(
    async (taskId: string, patch: UpdateStrategyTaskInput) => {
      const task = await updateStrategyTask(planId, taskId, patch);
      if (!task) return;
      setTasks((prev) => [...prev.filter((t) => t.id !== task.id), task]);
    },
    [planId],
  );

  const markTask = useCallback(
    async (taskId: string, state: StrategyTaskStatus) => {
      await updateTask(taskId, { status: state });
    },
    [updateTask],
  );

  const markAction = useCallback(
    (actionId: string, state: ActionState) => {
      const matchingTask = tasks.find(
        (task) => task.id === actionId || task.sourceActionId === actionId,
      );
      if (matchingTask) {
        void markTask(matchingTask.id, state);
        return;
      }
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
    [planId, isDemo, tasks, markTask],
  );

  const addTasks = useCallback(
    (
      parentNodeId: string,
      newTasks: { name: string; recommendation: string }[],
    ) => {
      void Promise.all(
        newTasks.map((task) =>
          createTask({
            parentNodeId,
            parentNodeKind: parentNodeId === "goal" ? "goal" : "pillar",
            title: task.name,
            recommendation: task.recommendation,
            dueDate: todayLocalDate(),
            source: "strategy_map",
          }),
        ),
      );
    },
    [createTask],
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

  const rollups = useMemo(() => {
    const ids = new Set<string>(["goal"]);
    if (stored) {
      stored.plan.strategicPillars.forEach((pillar) => {
        ids.add(pillar.id);
        pillar.actions.forEach((action) => ids.add(action.id));
      });
    }
    tasks.forEach((task) => {
      ids.add(task.id);
      ids.add(task.parentNodeId);
      if (task.parentTaskId) ids.add(task.parentTaskId);
    });
    const next: Record<string, NodeRollup> = {};
    ids.forEach((id) => {
      next[id] = computeNodeRollup(id, tasks);
    });
    return next;
  }, [stored, tasks]);

  const value: PlanContextValue | null = useMemo(() => {
    if (!stored) return null;
    return {
      planId,
      plan: stored.plan,
      stored,
      tasks,
      rollups,
      isDemo,
      isReady,
      markAction,
      createTask,
      updateTask,
      markTask,
      addTasks,
      applyOpportunityResult,
      refresh: () => {
        refresh();
        void refreshTasks();
      },
    };
  }, [
    planId,
    stored,
    tasks,
    rollups,
    isDemo,
    isReady,
    markAction,
    createTask,
    updateTask,
    markTask,
    addTasks,
    applyOpportunityResult,
    refresh,
    refreshTasks,
  ]);

  return (
    <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
  );
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
