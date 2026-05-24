"use client";

export function GoalTreeLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface px-8 py-6 shadow-soft">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-elevated border-t-accent"
          aria-hidden
        />
        <p className="text-[13px] font-medium text-secondary">
          Mapping your route…
        </p>
      </div>
    </div>
  );
}
