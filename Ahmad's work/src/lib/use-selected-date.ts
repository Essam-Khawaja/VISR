"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { todayISODate } from "./timeline-utils";

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function useSelectedDate(): [string, (iso: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
