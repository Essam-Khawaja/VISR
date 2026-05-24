"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { OnboardingForm } from "./OnboardingForm";
import { GenerationLoading } from "./GenerationLoading";
import { OnboardingMapPanel } from "./OnboardingMapPanel";
import {
  emptyForm,
  type OnboardingFormData,
} from "./onboardingTypes";
import {
  emptyMapState,
  type OnboardingMapState,
} from "./onboardingMapTypes";
import { demoPlanId } from "@/lib/shared/env";
import { savePlan } from "@/lib/2/planStore";
import type { StrategyPlan } from "@/lib/2/types";

const DRAFT_KEY = "pathwise-onboarding-draft-v2";

type Draft = {
  profile: OnboardingFormData;
  map: OnboardingMapState;
  step: number;
};

function loadDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Draft;
  } catch {
    return null;
  }
}

function persistDraft(draft: Draft) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {}
}

export function OnboardingShell() {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingFormData>(emptyForm);
  const [mapState, setMapState] = useState<OnboardingMapState>(emptyMapState);
  const [step, setStep] = useState(0);
  const [insight, setInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setProfile({ ...emptyForm, ...draft.profile });
      setMapState({ ...emptyMapState, ...draft.map });
      setStep(draft.step);
    }
  }, []);

  useEffect(() => {
    persistDraft({ profile, map: mapState, step });
  }, [profile, mapState, step]);

  const onProfileChange = useCallback((patch: Partial<OnboardingFormData>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const onMapStateChange = useCallback((next: OnboardingMapState) => {
    setMapState(next);
  }, []);

  const onStepChange = useCallback((nextStep: number) => {
    setStep(nextStep);
  }, []);

  const fetchInsight = useCallback(
    async (completedStep: number) => {
      setIsInsightLoading(true);
      try {
        const res = await fetch("/api/2/onboarding/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: ["destination", "courses", "commitments", "constraints", "brain-dump"][completedStep],
            profile,
            map: mapState,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            ok: boolean;
            insight?: string;
            bottleneckPreview?: string;
            concernLabels?: string[];
          };
          if (data.insight) setInsight(data.insight);
          if (data.bottleneckPreview) {
            setMapState((prev) => ({
              ...prev,
              bottleneckPreview: data.bottleneckPreview!,
            }));
          }
          if (data.concernLabels && data.concernLabels.length > 0) {
            setMapState((prev) => ({
              ...prev,
              concerns: data.concernLabels!.map((label, i) => ({
                id: `concern-${i}`,
                label,
              })),
            }));
          }
        } else {
          setInsight(null);
        }
      } catch {
        setInsight(null);
      } finally {
        setIsInsightLoading(false);
      }
    },
    [profile, mapState],
  );

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/2/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) {
        if (res.status === 404) {
          window.sessionStorage.removeItem(DRAFT_KEY);
          router.push(`/2/dashboard/${demoPlanId}`);
          return;
        }
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as {
        ok?: boolean;
        planId: string;
        plan: StrategyPlan;
      };
      if (data.plan) savePlan(data.planId, data.plan);
      window.sessionStorage.removeItem(DRAFT_KEY);
      router.push(`/2/dashboard/${data.planId}`);
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Something went wrong. Try again.",
      );
      setSubmitting(false);
    }
  }, [profile, router]);

  const handleRetry = useCallback(() => {
    setSubmitError(null);
    handleSubmit();
  }, [handleSubmit]);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-base">
      <div className="shrink-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6" style={{ maxHeight: "50vh" }}>
        <OnboardingForm
          profile={profile}
          onProfileChange={onProfileChange}
          mapState={mapState}
          onMapStateChange={onMapStateChange}
          currentStep={step}
          onStepChange={onStepChange}
          onInsightFetch={fetchInsight}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </div>

      <div className="relative min-h-[320px] flex-1 border-t border-border">
        <OnboardingMapPanel
          mapState={mapState}
          insight={insight}
          isInsightLoading={isInsightLoading}
        />
        <AnimatePresence>
          {submitting ? (
            <GenerationLoading
              error={submitError}
              onRetry={handleRetry}
              overlay
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
