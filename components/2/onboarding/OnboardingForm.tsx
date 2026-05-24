"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Card } from "@/components/2/ui/Card";
import { Button } from "@/components/2/ui/Button";
import { Input } from "@/components/2/ui/Input";
import { OnboardingProgress } from "./OnboardingProgress";
import { ChipInput } from "./ChipInput";
import type {
  OnboardingFormData,
  OnboardingTaskSeed,
  StepErrors,
} from "./onboardingTypes";
import type { OnboardingMapState } from "./onboardingMapTypes";
import type { AcademicTerm } from "@/lib/2/types";
import { addLocalDays, todayLocalDate } from "@/lib/2/taskStore";
import {
  applyMapDelta,
  currentSemesterId,
} from "./applyMapDelta";
  addLocalDays,
  todayLocalDate,
} from "@/lib/2/taskStore";
import DatePicker from "@/components/1/ui/DatePicker";
import {
  buildCurrentSemesterNodes,
  buildSemesterNodes,
  buildYearNodes,
} from "@/components/2/graph/buildOnboardingLayout";
import { ease } from "@/lib/shared/motion";

const STEPS = [
  { id: "end_state", label: "End State" },
  { id: "university_context", label: "University" },
  { id: "year_zoom", label: "Year" },
  { id: "current_semester", label: "Semester" },
  { id: "task_seed", label: "Tasks" },
  { id: "handoff", label: "Bottleneck" },
];

const TERMS: AcademicTerm[] = ["Fall", "Winter", "Spring", "Summer"];

function validate(step: number, value: OnboardingFormData): StepErrors {
  const errors: StepErrors = {};
  if (step === 0 && !value.endOfUniversityGoal.trim()) {
    errors.endOfUniversityGoal = "Required.";
  }
  if (step === 1) {
    if (!value.university.trim()) errors.university = "Required.";
    if (!value.degree.trim()) errors.degree = "Required.";
    if (value.expectedProgramLengthYears < 1)
      errors.expectedProgramLengthYears = "Required.";
    if (value.totalCoursesRequired < 1)
      errors.totalCoursesRequired = "Required.";
  }
  if (step === 3 && value.currentCourses.length === 0) {
    errors.currentCourses = "Add at least one current course.";
  }
  if (step === 5 && !value.bottleneckConcern.trim()) {
    errors.bottleneckConcern = "Name the risk.";
  }
  return errors;
}

type Props = {
  profile: OnboardingFormData;
  onProfileChange: (patch: Partial<OnboardingFormData>) => void;
  mapState: OnboardingMapState;
  onMapStateChange: (next: OnboardingMapState) => void;
  currentStep: number;
  onStepChange: (step: number) => void;
  onInsightFetch: (step: number) => void;
  submitting: boolean;
  onSubmit: () => void;
};

export function OnboardingForm({
  profile,
  onProfileChange,
  mapState,
  onMapStateChange,
  currentStep,
  onStepChange,
  onInsightFetch,
  submitting,
  onSubmit,
}: Props) {
  const [errors, setErrors] = useState<StepErrors>({});
  const [taskDraft, setTaskDraft] = useState<OnboardingTaskSeed>({
    id: `seed-${Date.now()}`,
    parentNodeId: currentSemesterId(profile),
    title: "",
    dueDate: todayLocalDate(),
    priority: "High",
  });
  const stepErrors = useMemo(() => errors, [errors]);
  const parentOptions = useMemo(
    () =>
      mapState.nodes
        .filter((node) => node.scope === "semester" || node.kind === "semester")
        .map((node) => ({ id: node.id, title: node.title })),
    [mapState.nodes],
  );

  const tryNext = () => {
    const next = validate(currentStep, profile);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onInsightFetch(Math.min(currentStep, 4));
    onStepChange(Math.min(STEPS.length - 1, currentStep + 1));
  };

  const back = () => {
    setErrors({});
    onStepChange(Math.max(0, currentStep - 1));
  };

  const handleSubmit = () => {
    const next = validate(5, profile);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onMapStateChange(applyMapDelta(5, profile, mapState));
    onSubmit();
  };

  const addTaskSeed = () => {
    const title = taskDraft.title.trim();
    if (!title || !taskDraft.dueDate) return;
    onProfileChange({
      taskSeeds: [...profile.taskSeeds, { ...taskDraft, title }],
    });
    setTaskDraft({
      id: `seed-${Date.now()}`,
      parentNodeId: currentSemesterId(profile),
      title: "",
      dueDate: addLocalDays(todayLocalDate(), 1),
      priority: "High",
    });
  };

  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="flex w-full flex-col gap-3">
      <OnboardingProgress steps={STEPS} current={currentStep} />
      <Card noHover className="max-h-[calc(100dvh-7rem)] overflow-y-auto bg-surface/90 p-5 shadow-lift backdrop-blur-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease }}
          >
            {currentStep === 0 ? (
              <EndStateStep
                value={profile}
                onChange={onProfileChange}
                errors={stepErrors}
              />
            ) : null}
            {currentStep === 1 ? (
              <UniversityStep
                value={profile}
                onChange={onProfileChange}
                errors={stepErrors}
              />
            ) : null}
            {currentStep === 2 ? (
              <YearStep value={profile} onChange={onProfileChange} />
            ) : null}
            {currentStep === 3 ? (
              <SemesterStep
                value={profile}
                onChange={onProfileChange}
                errors={stepErrors}
              />
            ) : null}
            {currentStep === 4 ? (
              <TaskSeedStep
                value={profile}
                taskDraft={taskDraft}
                setTaskDraft={setTaskDraft}
                parentOptions={parentOptions}
                onAdd={addTaskSeed}
              />
            ) : null}
            {currentStep === 5 ? (
              <HandoffStep
                value={profile}
                onChange={onProfileChange}
                errors={stepErrors}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </Card>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface/80 px-3 py-2 shadow-soft backdrop-blur">
        {currentStep > 0 ? (
          <Button variant="ghost" onClick={back} disabled={submitting}>
            Back
          </Button>
        ) : (
          <span />
        )}
        {isLast ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Building..." : "Build dashboard"}
          </Button>
        ) : (
          <Button onClick={tryNext}>Continue</Button>
        )}
      </div>
    </div>
  );
}

function SectionIntro({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">
        Pathwise onboarding
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-primary">
        {title}
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-secondary">{body}</p>
    </div>
  );
}

function EndStateStep({
  value,
  onChange,
  errors,
}: {
  value: OnboardingFormData;
  onChange: (patch: Partial<OnboardingFormData>) => void;
  errors: StepErrors;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionIntro
        title="What do you want to be at the end of university?"
        body="Start with the long-range identity. The map will zoom from this outcome down to this semester."
      />
      <textarea
        value={value.endOfUniversityGoal}
        onChange={(e) =>
          onChange({
            endOfUniversityGoal: e.target.value,
            targetGoal: e.target.value,
          })
        }
        rows={4}
        placeholder="A software engineering candidate with shipped products and internship experience."
        className="w-full resize-none rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-primary outline-none transition-colors placeholder:text-tertiary focus:border-accent"
      />
      {errors.endOfUniversityGoal ? (
        <p className="text-xs text-danger">{errors.endOfUniversityGoal}</p>
      ) : null}
    </div>
  );
}

function UniversityStep({
  value,
  onChange,
  errors,
}: {
  value: OnboardingFormData;
  onChange: (patch: Partial<OnboardingFormData>) => void;
  errors: StepErrors;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionIntro
        title="Map your university path."
        body="These answers create the year-by-year route and highlight where you are now."
      />
      <Input
        name="university"
        label="University"
        value={value.university}
        onChange={(e) => onChange({ university: e.target.value })}
        error={errors.university}
      />
      <Input
        name="degree"
        label="Degree/program"
        value={value.degree}
        onChange={(e) => onChange({ degree: e.target.value })}
        error={errors.degree}
      />
      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Program years"
          value={value.expectedProgramLengthYears}
          onChange={(n) => onChange({ expectedProgramLengthYears: n })}
        />
        <NumberInput
          label="Current year"
          value={value.currentYearIndex}
          onChange={(n) => onChange({ currentYearIndex: n, year: `Year ${n}` })}
        />
        <NumberInput
          label="Required courses"
          value={value.totalCoursesRequired}
          onChange={(n) => onChange({ totalCoursesRequired: n })}
        />
        <NumberInput
          label="Completed"
          value={value.coursesCompleted}
          onChange={(n) => onChange({ coursesCompleted: n })}
        />
      </div>
    </div>
  );
}

function YearStep({
  value,
  onChange,
}: {
  value: OnboardingFormData;
  onChange: (patch: Partial<OnboardingFormData>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionIntro
        title="Zoom into this year."
        body="Pathwise will split the year into semesters and place recurring commitments where they belong."
      />
      <label className="flex flex-col gap-1.5 text-xs font-semibold text-secondary">
        Current semester
        <select
          value={value.currentSemester}
          onChange={(e) =>
            onChange({ currentSemester: e.target.value as AcademicTerm })
          }
          className="rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-primary outline-none focus:border-accent"
        >
          {TERMS.map((term) => (
            <option key={term}>{term}</option>
          ))}
        </select>
      </label>
      <ChipInput
        name="commitments"
        label="Clubs, work, research, projects"
        placeholder="Club lead, part-time job, research lab"
        value={value.commitments}
        onChange={(items) =>
          onChange({
            commitments: items,
            recurringCommitments: items.map((title, i) => ({
              id: `commitment-${i}`,
              title,
              kind: "other",
              semesters: [value.currentSemester],
            })),
          })
        }
        hint="For the MVP, these attach to the current semester."
        maxChips={12}
      />
      <label className="flex items-center gap-2 text-xs font-medium text-secondary">
        <input
          type="checkbox"
          checked={value.plansSpringSummerCourses}
          onChange={(e) =>
            onChange({ plansSpringSummerCourses: e.target.checked })
          }
        />
        I may take spring or summer courses
      </label>
    </div>
  );
}

function SemesterStep({
  value,
  onChange,
  errors,
}: {
  value: OnboardingFormData;
  onChange: (patch: Partial<OnboardingFormData>) => void;
  errors: StepErrors;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionIntro
        title="Plan the current semester."
        body="Exact classes and constraints become the context for the dashboard."
      />
      <ChipInput
        name="currentCourses"
        label="Exact classes"
        placeholder="Algorithms, Databases, Operating Systems"
        value={value.currentCourses}
        onChange={(items) => onChange({ currentCourses: items })}
        error={errors.currentCourses}
      />
      <NumberInput
        label="Work hours/week"
        value={value.workHoursPerWeek}
        onChange={(n) => onChange({ workHoursPerWeek: n })}
      />
      <ChipInput
        name="constraints"
        label="Constraints"
        placeholder="No late nights, commute, Fridays lighter"
        value={value.constraints}
        onChange={(items) => onChange({ constraints: items })}
        maxChips={10}
      />
    </div>
  );
}

function TaskSeedStep({
  value,
  taskDraft,
  setTaskDraft,
  parentOptions,
  onAdd,
}: {
  value: OnboardingFormData;
  taskDraft: OnboardingTaskSeed;
  setTaskDraft: (task: OnboardingTaskSeed) => void;
  parentOptions: { id: string; title: string }[];
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionIntro
        title="What are the first tasks you know must happen?"
        body="No AI task generation here. Add only the tasks you actually trust."
      />
      <Input
        name="taskTitle"
        label="Task"
        value={taskDraft.title}
        onChange={(e) => setTaskDraft({ ...taskDraft, title: e.target.value })}
        placeholder="Push project skeleton to GitHub"
      />
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <DatePicker
          value={taskDraft.dueDate}
          onChange={(val) => setTaskDraft({ ...taskDraft, dueDate: val })}
          placeholder="Due date"
        />
        <select
          value={taskDraft.priority}
          onChange={(e) =>
            setTaskDraft({
              ...taskDraft,
              priority: e.target.value as OnboardingTaskSeed["priority"],
            })
          }
          className="rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-primary outline-none focus:border-accent"
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>
      <label className="flex flex-col gap-1.5 text-xs font-semibold text-secondary">
        Parent node
        <select
          value={taskDraft.parentNodeId}
          onChange={(e) =>
            setTaskDraft({ ...taskDraft, parentNodeId: e.target.value })
          }
          className="rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-primary outline-none focus:border-accent"
        >
          <option value={currentSemesterId(value)}>{value.currentSemester}</option>
          {parentOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.title}
            </option>
          ))}
        </select>
      </label>
      <Button variant="secondary" onClick={onAdd}>
        Add task to map
      </Button>
      {value.taskSeeds.length > 0 ? (
        <ul className="space-y-1.5">
          {value.taskSeeds.map((task) => (
            <li
              key={task.id}
              className="rounded-xl border border-border bg-white/70 px-3 py-2 text-xs text-secondary"
            >
              <span className="font-semibold text-primary">{task.title}</span>{" "}
              · {task.priority} · {task.dueDate}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function HandoffStep({
  value,
  onChange,
  errors,
}: {
  value: OnboardingFormData;
  onChange: (patch: Partial<OnboardingFormData>) => void;
  errors: StepErrors;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionIntro
        title="What is most likely to break this semester?"
        body="This becomes the first bottleneck Pathwise tracks on the dashboard."
      />
      <textarea
        value={value.bottleneckConcern}
        onChange={(e) =>
          onChange({
            bottleneckConcern: e.target.value,
            brainDump: e.target.value,
          })
        }
        rows={4}
        placeholder="I keep adding commitments, but my portfolio project still is not shipped."
        className="w-full resize-none rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm text-primary outline-none transition-colors placeholder:text-tertiary focus:border-accent"
      />
      {errors.bottleneckConcern ? (
        <p className="text-xs text-danger">{errors.bottleneckConcern}</p>
      ) : null}
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-semibold text-secondary">
      {label}
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="rounded-xl border border-border bg-white/80 px-3 py-2 text-sm text-primary outline-none focus:border-accent"
      />
    </label>
  );
}
