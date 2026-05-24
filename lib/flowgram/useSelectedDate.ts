/**
 * useSelectedDate.ts
 *
 * Hook that synchronizes the Flowgram day-view selection with the URL
 * `?date=YYYY-MM-DD` query param. Today is the default and is represented
 * as the absence of the param so that bookmarks remain stable. All page
 * components rely on this hook so the day, week, settings, and notes views
 * navigate to the same date consistently.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { todayISODate } from "./timelineUtils";

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function useSelectedDate(): [string, (iso: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from the URL on first paint to avoid a hydration flash.
  const initial = (() => {
    const q = searchParams.get("date");
    return q && ISO_RE.test(q) ? q : todayISODate();
  })();

  const [date, setDate] = useState<string>(initial);

  useEffect(() => {
    const q = searchParams.get("date");
    const next = q && ISO_RE.test(q) ? q : todayISODate();
    setDate((prev) => (prev === next ? prev : next));
  }, [searchParams]);

  const setSelectedDate = useCallback(
    (iso: string) => {
      if (!ISO_RE.test(iso)) return;
      setDate(iso);
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      // Drop the date param entirely when it equals today so the URL stays clean.
      if (iso === todayISODate()) {
        params.delete("date");
      } else {
        params.set("date", iso);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams]
  );

  return [date, setSelectedDate];
}
