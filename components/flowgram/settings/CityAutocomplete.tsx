"use client";

import { useEffect, useRef, useState } from "react";
import { CityResult } from "@/lib/flowgram/types";
import { MapPin, Loader2 } from "lucide-react";

type CityAutocompleteProps = {
  value: string;
  countryCode?: string;
  onSelect: (city: CityResult) => void;
  onTextChange: (text: string) => void;
};

export default function CityAutocomplete({
  value,
  countryCode,
  onSelect,
  onTextChange,
}: CityAutocompleteProps) {
  const [results, setResults] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: value.trim() });
        if (countryCode) params.set("country", countryCode);
        const res = await fetch(`/api/flowgram/cities?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, countryCode]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onTextChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Start typing your city..."
          className="w-full input-soft pr-9"
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>
      </div>

      {open && value.trim().length >= 2 && (results.length > 0 || !loading) && (
        <div className="absolute z-30 left-0 right-0 mt-2 glass-card rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
          {results.length === 0 && !loading ? (
            <div className="px-3 py-3 text-xs text-stone-500">
              No cities found. Try a longer name.
            </div>
          ) : (
            results.map((city, i) => (
              <button
                key={`${city.name}-${city.lat}-${city.lon}-${i}`}
                type="button"
                onClick={() => {
                  onSelect(city);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-stone-50 flex items-center gap-2 border-b border-stone-100 last:border-0"
              >
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-900 truncate">
                    {city.name}
                    {city.state && (
                      <span className="text-stone-500 font-normal">
                        , {city.state}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">
                    {city.country}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
