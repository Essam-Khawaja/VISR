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
  createStrategyNode,
  type CreateStrategyNodeInput,
  fetchNodesFromSupabase,
  loadNodes,
  type UpdateStrategyNodeInput,
  updateStrategyNode,
} from "@/lib/2/nodeStore";
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
  StrategyNode,
  StrategyPlan,
  StrategyTask,
  StrategyTaskStatus,
} from "@/lib/2/types";

type PlanContextValue = {
  planId: string;
  plan: StrategyPlan;
  stored: StoredPlan;
  nodes: StrategyNode[];
  tasks: StrategyTask[];
  rollups: Record<string, NodeRollup>;
  isDemo: boolean;
  isReady: boolean;
  markAction: (actionId: string, state: ActionState) => void;
  createNode: (input: CreateStrategyNodeInput) => Promise<StrategyNode>;
  updateNode: (
    nodeId: string,
    patch: UpdateStrategyNodeInput,
  ) => Promise<void>;
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

function planToNodes(plan: StrategyPlan): StrategyNode[] {
  const now = new Date().toISOString();
  const root: StrategyNode = {
    id: "goal",
    planId: plan.id,
    parentNodeId: null,
    kind: "university_outcome",
    title: plan.destination,
    subtitle: plan.currentStage,
    status: "open",
    scope: "focus",
    sortOrder: 0,
    metadata: {},
    createdAt: now,
    updatedAt: now,
  };
  const pillarNodes = plan.strategicPillars.flatMap((pillar, pillarIndex) => {
    const pillarNode: StrategyNode = {
      id: pillar.id,
      planId: plan.id,
      parentNodeId: root.id,
      kind: "strategic_pillar",
      title: pillar.name,
      subtitle: pillar.reason,
      status: pillar.status === "Weak" || pillar.status === "Missing" ? "at_risk" : "open",
      scope: "focus",
      sortOrder: pillarIndex + 1,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    };
    const actionNodes: StrategyNode[] = pillar.actions.map((action, actionIndex) => ({
      id: action.id,
      planId: plan.id,
      parentNodeId: pillar.id,
      kind: "task",
      title: action.name,
      subtitle: action.recommendation,
      status: action.status === "At Risk" ? "at_risk" : "open",
      scope: "focus",
      sortOrder: actionIndex,
      metadata: { legacyAction: true },
      createdAt: now,
      updatedAt: now,
    }));
    return [pillarNode, ...actionNodes];
  });
  return [root, ...pillarNodes];
}

export function PlanProvider({ planId, initialPlan, children }: Props) {
  const isDemo = planId === DEMO_PLAN_ID || planId.startsWith("demo-");
  const [stored, setStored] = useState<StoredPlan | null>(null);
  const [nodes, setNodes] = useState<StrategyNode[]>([]);
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
      setNodes(loadNodes(planId).length > 0 ? loadNodes(planId) : planToNodes(demoPlan));
      setTasks(ensureMaterializedTasks(demoPlan));
      setIsReady(true);
      return;
    }

    // 1) Optimistic paint from localStorage cache.
    const fromCache = loadStoredPlan(planId);
    if (fromCache) {
      setStored(fromCache);
      setNodes(loadNodes(planId).length > 0 ? loadNodes(planId) : planToNodes(fromCache.plan));
      ensureMaterializedTasks(fromCache.plan);
      setTasks(migrateActionStatesToTasks(planId, fromCache.actionStates));
    } else if (initialPlan) {
      savePlan(planId, initialPlan);
      const fresh = loadStoredPlan(planId);
      setStored(fresh);
      setNodes(loadNodes(planId).length > 0 ? loadNodes(planId) : planToNodes(initialPlan));
      setTasks(ensureMaterializedTasks(initialPlan));
    } else {
      setStored(null);
      setNodes([]);
    }
    setIsReady(true);

    // 2) Background-hydrate from Supabase (source of truth).
    (async () => {
      const fromSupabase = await fetchStoredPlanFromSupabase(planId);
      if (cancelled) return;
      if (fromSupabase) {
        setStored(fromSupabase);
        setNodes(loadNodes(planId).length > 0 ? loadNodes(planId) : planToNodes(fromSupabase.plan));
        ensureMaterializedTasks(fromSupabase.plan);
        setTasks(migrateActionStatesToTasks(planId, fromSupabase.actionStates));
      }
    })();

    void fetchNodesFromSupabase(planId).then((fromNodes) => {
      if (!cancelled && fromNodes.length > 0) setNodes(fromNodes);
    });

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

  const refreshNodes = useCallback(async () => {
    const fromNodes = await fetchNodesFromSupabase(planId);
    setNodes(fromNodes);
  }, [planId]);

  const createNode = useCallback(async (input: CreateStrategyNodeInput) => {
    const node = await createStrategyNode(input);
    setNodes((prev) => [...prev.filter((n) => n.id !== node.id), node]);
    return node;
  }, []);

  const updateNode = useCallback(
    async (nodeId: string, patch: UpdateStrategyNodeInput) => {
      const node = await updateStrategyNode(planId, nodeId, patch);
      if (!node) return;
      setNodes((prev) => [...prev.filter((n) => n.id !== node.id), node]);
    },
    [planId],
  );

  const createTask = useCallback(
    async (input: Omit<CreateStrategyTaskInput, "planId">) => {
      const graphNode = await createStrategyNode({
        planId,
        parentNodeId: input.parentNodeId,
        kind: "task",
        title: input.title,
        subtitle: input.recommendation,
        status: "open",
        scope: "focus",
        sortOrder: input.sortOrder ?? 0,
        metadata: { dueDate: input.dueDate, priority: input.priority ?? "Medium" },
      });
      setNodes((prev) => [
        ...prev.filter((node) => node.id !== graphNode.id),
        graphNode,
      ]);
      const task = await createStrategyTask({
        ...input,
        planId,
        graphNodeId: graphNode.id,
      });
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
      nodes,
      tasks,
      rollups,
      isDemo,
      isReady,
      markAction,
      createNode,
      updateNode,
      createTask,
      updateTask,
      markTask,
      addTasks,
      applyOpportunityResult,
      refresh: () => {
        refresh();
        void refreshTasks();
        void refreshNodes();
      },
    };
  }, [
    planId,
    stored,
    nodes,
    tasks,
    rollups,
    isDemo,
    isReady,
    markAction,
    createNode,
    updateNode,
    createTask,
    updateTask,
    markTask,
    addTasks,
    applyOpportunityResult,
    refresh,
    refreshTasks,
    refreshNodes,
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
