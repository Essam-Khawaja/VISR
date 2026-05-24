"use client";

import { useEffect, useState } from "react";
import { UserSettings, CityResult } from "@/lib/1/types";
import { COUNTRIES, getCountryByCode } from "@/lib/1/countries";
import { TIMEZONES, getBrowserTimezone } from "@/lib/1/timezones";
import CityAutocomplete from "./CityAutocomplete";
import { Check, Loader2, Settings as SettingsIcon } from "lucide-react";
import TimePicker from "@/components/1/ui/TimePicker";

export default function SettingsForm() {
  const [city, setCity] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/1/settings");
      if (res.ok) {
        const data: UserSettings = await res.json();
        if (data) {
          setCity(data.city ?? "");
          setCountryCode(data.country_code ?? "");
          setCountry(
            data.country ??
              getCountryByCode(data.country_code ?? "")?.name ??
              ""
          );
          setTimezone(data.timezone ?? getBrowserTimezone());
          setWakeTime((data.wake_time ?? "07:00").slice(0, 5));
          setSleepTime((data.sleep_time ?? "23:00").slice(0, 5));
        } else {
          setTimezone(getBrowserTimezone());
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCountryChange(code: string) {
    setCountryCode(code);
    const c = getCountryByCode(code);
    setCountry(c?.name ?? "");
  }

  function handleCitySelect(c: CityResult) {
    setCity(c.name);
    if (c.country_code) {
      setCountryCode(c.country_code);
      setCountry(c.country);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/1/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          country,
          country_code: countryCode,
          timezone,
          wake_time: wakeTime,
          sleep_time: sleepTime,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-400 to-stone-600 flex items-center justify-center shadow-sm">
          <SettingsIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-sm font-semibold leading-tight text-stone-900">
            Your preferences
          </h2>
          <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
            Helps weather, free-time, and your morning briefing stay accurate
          </p>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
          Country
        </label>
        <select
          value={countryCode}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="w-full input-soft"
        >
          <option value="">Pick a country</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
          City
        </label>
        <CityAutocomplete
          value={city}
          countryCode={countryCode || undefined}
          onSelect={handleCitySelect}
          onTextChange={setCity}
        />
      </div>

      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
          Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full input-soft"
        >
          <option value="">Pick a timezone</option>
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
            Wake-up time
          </label>
          <TimePicker value={wakeTime} onChange={setWakeTime} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
            Sleep time
          </label>
          <TimePicker value={sleepTime} onChange={setSleepTime} />
        </div>
      </div>
      <p className="text-[11px] text-stone-500 -mt-2">
        Used to scope free-time searches to your awake hours.
      </p>

      <button
        type="submit"
        disabled={saving}
        className="w-full px-5 py-2.5 rounded-xl btn-primary text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saved && <Check className="w-4 h-4" />}
        {saved ? "Saved" : saving ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
