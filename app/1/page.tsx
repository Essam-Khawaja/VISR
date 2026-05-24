"use client";

import { Suspense, useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  TimelineEvent,
  Item,
  ChecklistItem,
  WeatherData,
  WeatherAdvice,
  UserSettings,
  SavedLocation,
  ManualChecklistItem,
  CustomCategory,
  PersonalTimeBlock,
} from "@/lib/1/types";
import { getWeatherAdvice } from "@/lib/1/weather";
import { formatDateLong, isSameDay, isoDateFromDate, todayISODate } from "@/lib/1/timeline-utils";
import { useSelectedDate } from "@/lib/1/use-selected-date";
import {
  blocksForDate,
  blocksToPhantomEvents,
} from "@/lib/1/personal-time";
import DayNavigator from "@/components/1/layout/DayNavigator";
import Timeline from "@/components/1/timeline/Timeline";
import BeforeYouLeave from "@/components/1/checklist/BeforeYouLeave";
import WeatherBanner from "@/components/1/weather/WeatherBanner";
import FreeTimeFinder from "@/components/1/free-time/FreeTimeFinder";
import EventForm from "@/components/1/events/EventForm";
import NoteEditor from "@/components/1/events/NoteEditor";
import DayOverview from "@/components/1/day-overview/DayOverview";
import EndOfDayReschedule from "@/components/1/reschedule/EndOfDayReschedule";
import RoutinesPanel from "@/components/1/routines/RoutinesPanel";
import VoiceBriefingButton from "@/components/1/voice/VoiceBriefingButton";
import ICSImportButton from "@/components/1/import/ICSImportButton";
import WeekChart from "@/components/1/week-chart/WeekChart";
import { Plus, Loader2, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";

const TRANSIT_MARKER = "auto-transit";

type LinkedItem = {
  id: string;
  event_id: string;
  item_id: string;
  is_one_time: boolean;
  items: Item;
};

function DashboardInner() {
  const [selectedDate, setSelectedDate] = useSelectedDate();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventItems, setEventItems] = useState<Record<string, Item[]>>({});
  const [eventItemLinks, setEventItemLinks] = useState<
    Record<string, LinkedItem[]>
  >({});
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(
    []
  );
  const [personalTimeBlocks, setPersonalTimeBlocks] = useState<
    PersonalTimeBlock[]
  >([]);
  const [defaultsList, setDefaultsList] = useState<
    { category: string; item_id: string }[]
  >([]);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [manualItems, setManualItems] = useState<ManualChecklistItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherAdvice, setWeatherAdvice] = useState<WeatherAdvice[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [bootLoading, setBootLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TimelineEvent | null>(null);
  const [editingNote, setEditingNote] = useState<TimelineEvent | null>(null);
  const [prefillSlot, setPrefillSlot] = useState<
    { start: string; end: string } | null
  >(null);
  const loadEventsCounter = useRef(0);

  const targetDate = useMemo(
    () => new Date(`${selectedDate}T12:00:00`),
    [selectedDate]
  );
  const today = new Date();
  const isToday = isSameDay(targetDate, today);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/1/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {}
  }, []);

  const loadLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/1/saved-locations");
      if (res.ok) setLocations(await res.json());
    } catch {}
  }, []);

  const loadCustomCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/1/custom-categories");
      if (res.ok) setCustomCategories(await res.json());
    } catch {}
  }, []);

  const loadPersonalTimeBlocks = useCallback(async () => {
    try {
      const res = await fetch("/api/1/personal-time");
      if (res.ok) setPersonalTimeBlocks(await res.json());
    } catch {}
  }, []);

  const loadDefaultsAndItems = useCallback(async () => {
    try {
      const [defRes, itemRes] = await Promise.all([
        fetch("/api/1/category-defaults"),
        fetch("/api/1/items"),
      ]);
      if (defRes.ok) setDefaultsList(await defRes.json());
      if (itemRes.ok) setAllItems(await itemRes.json());
    } catch {}
  }, []);

  const loadEvents = useCallback(async (date: string) => {
    const reqId = ++loadEventsCounter.current;
    setEventsLoading(true);
    try {
      const res = await fetch(`/api/1/events?date=${date}`);
      if (!res.ok) return;
      const data = (await res.json()) as TimelineEvent[];
      if (reqId !== loadEventsCounter.current) return;
      setEvents(data);

      if (data.length === 0) {
        setEventItems({});
        setEventItemLinks({});
        return;
      }

      const ids = data.map((e) => e.id).join(",");
      const r = await fetch(`/api/1/event-items?event_ids=${ids}`);
      if (reqId !== loadEventsCounter.current) return;
      if (r.ok) {
        const linked = (await r.json()) as LinkedItem[];
        const byEvent: Record<string, LinkedItem[]> = {};
        const itemMap: Record<string, Item[]> = {};
        for (const l of linked) {
          if (!l.event_id) continue;
          if (!byEvent[l.event_id]) byEvent[l.event_id] = [];
          byEvent[l.event_id].push(l);
        }
        for (const [eid, ls] of Object.entries(byEvent)) {
          itemMap[eid] = ls.map((l) => l.items).filter(Boolean);
        }
        setEventItemLinks(byEvent);
        setEventItems(itemMap);
      }
    } finally {
      if (reqId === loadEventsCounter.current) setEventsLoading(false);
    }
  }, []);

  const loadManualItems = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/1/manual-checklist?date=${date}`);
      if (res.ok) setManualItems(await res.json());
    } catch {}
  }, []);

  const loadWeather = useCallback(
    async (s: UserSettings | null, date: string) => {
      if (!s?.city) {
        setWeather(null);
        setWeatherAdvice([]);
        setWeatherLoading(false);
        return;
      }
      setWeatherLoading(true);
      try {
        const params = new URLSearchParams({ city: s.city, date });
        if (s.country_code) params.set("country", s.country_code);
        const res = await fetch(`/api/1/weather?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
          setWeatherAdvice(getWeatherAdvice(data));
        } else {
          setWeather(null);
          setWeatherAdvice([]);
        }
      } catch {
        setWeather(null);
        setWeatherAdvice([]);
      } finally {
        setWeatherLoading(false);
      }
    },
    []
  );

  const isLeavingHome = useCallback(
    (event: TimelineEvent): boolean => {
      if (event.location_id) {
        const loc = locations.find((l) => l.id === event.location_id);
        if (loc?.location_type === "home") return false;
        if (loc) return true;
      }
      const text = (event.location ?? "").toLowerCase().trim();
      if (!text) return false;
      const homeKeywords = [
        "home",
        "house",
        "apartment",
        "dorm",
        "bedroom",
        "living room",
        "desk",
        "kitchen",
        "remote",
        "online",
        "discord",
        "zoom",
        "teams",
        "google meet",
      ];
      return !homeKeywords.some((k) => text.includes(k));
    },
    [locations]
  );

  const buildChecklist = useCallback(
    (
      eventsForDay: TimelineEvent[],
      adv: WeatherAdvice[],
      links: Record<string, LinkedItem[]>,
      defaults: { category: string; item_id: string }[],
      items: Item[],
      forDate: string
    ) => {
      setChecklistLoading(true);
      try {
        const todayDate = new Date();
        const target = new Date(`${forDate}T12:00:00`);
        const targetIsToday = isSameDay(todayDate, target);
        const now = todayDate.getTime();

        const goingOut = eventsForDay.filter(isLeavingHome);
        const dayEnded = forDate < todayISODate();

        if (goingOut.length === 0 && adv.length === 0) {
          setChecklistItems([]);
          return;
        }

        const itemMap = new Map(items.map((i) => [i.id, i]));
        type EventRef = { title: string; start_time: string };
        const byName = new Map<
          string,
          {
            item: Item;
            source: ChecklistItem["source"];
            event_titles: Set<string>;
            event_refs: EventRef[];
          }
        >();

        function track(
          item: Item,
          source: ChecklistItem["source"],
          event?: TimelineEvent
        ) {
          const key = item.name.trim().toLowerCase();
          const existing = byName.get(key);
          if (existing) {
            if (event) {
              existing.event_titles.add(event.title);
              existing.event_refs.push({
                title: event.title,
                start_time: event.start_time,
              });
            }
            if (source === "event_specific") existing.source = source;
            return;
          }
          byName.set(key, {
            item,
            source,
            event_titles: new Set(event ? [event.title] : []),
            event_refs: event
              ? [{ title: event.title, start_time: event.start_time }]
              : [],
          });
        }

        const categoriesGoingOut = new Set<string>(
          goingOut.map((e) => e.category as string)
        );
        for (const def of defaults) {
          if (!categoriesGoingOut.has(def.category)) continue;
          const item = itemMap.get(def.item_id);
          if (!item) continue;
          for (const event of goingOut.filter((e) => e.category === def.category)) {
            track(item, "category_default", event);
          }
        }

        for (const event of goingOut) {
          const ls = links[event.id] ?? [];
          for (const l of ls) {
            if (!l.items || !l.is_one_time) continue;
            track(l.items, "event_specific", event);
          }
        }

        if (goingOut.length > 0) {
          const waterBottle = items.find(
            (i) => i.name.trim().toLowerCase() === "water bottle"
          );
          if (waterBottle) {
            const nextEvent = goingOut.find(
              (e) => new Date(e.start_time).getTime() > now
            );
            track(
              waterBottle,
              "category_default",
              nextEvent ?? goingOut[goingOut.length - 1]
            );
          }
        }

        for (const a of adv) {
          if (!a.item) continue;
          const synthetic: Item = {
            id: `weather-${a.item}`,
            name: a.item,
            icon: null,
            created_at: new Date().toISOString(),
          };
          track(synthetic, "weather");
        }

        function isEntryLocked(
          source: ChecklistItem["source"],
          eventRefs: EventRef[]
        ): boolean {
          if (dayEnded) return true;
          if (source === "weather") return false;
          if (eventRefs.length === 0) {
            return goingOut.every(
              (e) => new Date(e.start_time).getTime() <= now
            );
          }
          if (targetIsToday) {
            return eventRefs.every(
              (ref) => new Date(ref.start_time).getTime() <= now
            );
          }
          return false;
        }

        const result: ChecklistItem[] = Array.from(byName.values())
          .map((entry) => ({
            item: entry.item,
            source: entry.source,
            event_title: Array.from(entry.event_titles).join(", ") || undefined,
            event_titles: Array.from(entry.event_titles),
            checked: false,
            locked: isEntryLocked(entry.source, entry.event_refs),
          }))
          .sort((a, b) => Number(a.locked) - Number(b.locked));

        setChecklistItems(result);
      } finally {
        setChecklistLoading(false);
      }
    },
    [isLeavingHome]
  );

  useEffect(() => {
    (async () => {
      setBootLoading(true);
      await Promise.all([
        loadSettings(),
        loadLocations(),
        loadCustomCategories(),
        loadPersonalTimeBlocks(),
        loadDefaultsAndItems(),
      ]);
      setBootLoading(false);
    })();
  }, [
    loadSettings,
    loadLocations,
    loadCustomCategories,
    loadPersonalTimeBlocks,
    loadDefaultsAndItems,
  ]);

  useEffect(() => {
    loadEvents(selectedDate);
    loadManualItems(selectedDate);
  }, [selectedDate, loadEvents, loadManualItems]);

  useEffect(() => {
    if (settings) {
      loadWeather(settings, selectedDate);
    }
  }, [settings, selectedDate, loadWeather]);

  useEffect(() => {
    buildChecklist(
      events,
      weatherAdvice,
      eventItemLinks,
      defaultsList,
      allItems,
      selectedDate
    );
  }, [
    events,
    weatherAdvice,
    eventItemLinks,
    defaultsList,
    allItems,
    selectedDate,
    buildChecklist,
  ]);

  const personalPhantoms = useMemo(
    () =>
      blocksToPhantomEvents(
        blocksForDate(personalTimeBlocks, targetDate),
        targetDate
      ),
    [personalTimeBlocks, targetDate]
  );

  const displayEvents = useMemo(
    () =>
      [...events, ...personalPhantoms].sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      ),
    [events, personalPhantoms]
  );

  async function addManualItem(name: string) {
    await fetch("/api/1/manual-checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_name: name, for_date: selectedDate }),
    });
    await loadManualItems(selectedDate);
  }

  async function deleteManualItem(id: string) {
    await fetch(`/api/1/manual-checklist?id=${id}`, { method: "DELETE" });
    await loadManualItems(selectedDate);
  }

  async function toggleManualItem(id: string, checked: boolean) {
    const previous = manualItems;
    setManualItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, checked } : m))
    );
    try {
      const res = await fetch("/api/1/manual-checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, checked }),
      });
      if (!res.ok) throw new Error("toggle failed");
    } catch {
      setManualItems(previous);
    }
  }

  async function maybeAddTransitBlocks(event: TimelineEvent) {
    if (!event.auto_transit || !event.location_id) return;
    const loc = locations.find((l) => l.id === event.location_id);
    if (!loc || loc.transit_minutes <= 0) return;

    const beforeStart = new Date(
      new Date(event.start_time).getTime() - loc.transit_minutes * 60 * 1000
    );
    const beforeEnd = new Date(event.start_time);
    const afterStart = new Date(event.end_time);
    const afterEnd = new Date(
      new Date(event.end_time).getTime() + loc.transit_minutes * 60 * 1000
    );

    const eventDate = isoDateFromDate(beforeStart);
    const existingRes = await fetch(`/api/1/events?date=${eventDate}`);
    const existing: TimelineEvent[] = existingRes.ok
      ? await existingRes.json()
      : [];

    const hasBefore = existing.some(
      (e) =>
        e.category === "transit" &&
        e.description?.includes(TRANSIT_MARKER) &&
        Math.abs(new Date(e.end_time).getTime() - beforeEnd.getTime()) < 60000
    );
    const hasAfter = existing.some(
      (e) =>
        e.category === "transit" &&
        e.description?.includes(TRANSIT_MARKER) &&
        Math.abs(new Date(e.start_time).getTime() - afterStart.getTime()) <
          60000
    );

    const toCreate: Array<Partial<TimelineEvent>> = [];
    if (!hasBefore) {
      toCreate.push({
        title: `Transit to ${loc.name}`,
        description: `${TRANSIT_MARKER} for ${event.title}`,
        category: "transit",
        start_time: beforeStart.toISOString(),
        end_time: beforeEnd.toISOString(),
        location: loc.name,
      });
    }
    if (!hasAfter) {
      toCreate.push({
        title: `Transit from ${loc.name}`,
        description: `${TRANSIT_MARKER} for ${event.title}`,
        category: "transit",
        start_time: afterStart.toISOString(),
        end_time: afterEnd.toISOString(),
        location: loc.name,
      });
    }

    for (const block of toCreate) {
      await fetch("/api/1/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(block),
      });
    }
  }

  async function handleCreateEvent(data: Partial<TimelineEvent>) {
    const res = await fetch("/api/1/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created: TimelineEvent = await res.json();
      await maybeAddTransitBlocks(created);
      await loadEvents(selectedDate);
    }
  }

  async function handleUpdateEvent(data: Partial<TimelineEvent>) {
    if (!editing) return;
    const res = await fetch("/api/1/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editing.id, ...data }),
    });
    if (res.ok) {
      const updated: TimelineEvent = await res.json();
      await maybeAddTransitBlocks(updated);
      await loadEvents(selectedDate);
    }
  }

  async function handleDeleteEvent(event: TimelineEvent) {
    await fetch(`/api/1/events?id=${event.id}`, { method: "DELETE" });
    await loadEvents(selectedDate);
  }

  async function handleToggleComplete(event: TimelineEvent) {
    await fetch("/api/1/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: event.id, completed: !event.completed }),
    });
    await loadEvents(selectedDate);
  }

  async function handleReschedule(event: TimelineEvent, newStart: string) {
    const dur =
      new Date(event.end_time).getTime() - new Date(event.start_time).getTime();
    const newEnd = new Date(new Date(newStart).getTime() + dur);
    await fetch("/api/1/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: event.id,
        start_time: newStart,
        end_time: newEnd.toISOString(),
      }),
    });
    await loadEvents(selectedDate);
  }

  const showSetupHint =
    !bootLoading && (!settings?.city || !settings?.country_code);

  return (
    <div className="min-h-screen pb-24">
      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-3 sm:space-y-4">
        <DayNavigator selectedDate={selectedDate} onChange={setSelectedDate} />

        {!isToday && (
          <div className="text-center -mt-1">
            <p className="text-[11px] text-tertiary">
              {formatDateLong(`${selectedDate}T12:00:00`)}
            </p>
          </div>
        )}

        {showSetupHint && (
          <div className="rounded-2xl border border-amaranth/22 bg-amaranth/[0.06] px-4 py-3 flex items-center gap-3">
            <SettingsIcon className="w-4 h-4 text-amaranth shrink-0" strokeWidth={1.8} />
            <p className="text-xs text-amaranth flex-1 leading-relaxed">
              Set your city and timezone in{" "}
              <Link
                href="/1/settings"
                className="font-semibold underline decoration-amaranth/40 underline-offset-2"
              >
                settings
              </Link>{" "}
              to unlock weather, free-time, and routine planning.
            </p>
          </div>
        )}

        <WeatherBanner
          weather={weather}
          advice={weatherAdvice}
          city={settings?.city ?? ""}
          loading={weatherLoading && settings?.city != null}
          unavailableReason={
            settings?.city
              ? "Forecast not available for this date."
              : "Set your city in settings to see weather."
          }
        />

        {isToday && (
          <DayOverview events={events} city={settings?.city ?? ""} />
        )}

        {checklistLoading || eventsLoading ? (
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
            <p className="text-xs text-stone-500">
              Building your packing list...
            </p>
          </div>
        ) : (
          <BeforeYouLeave
            items={checklistItems}
            manualItems={manualItems}
            forDate={selectedDate}
            onAddManual={addManualItem}
            onDeleteManual={deleteManualItem}
            onToggleManual={toggleManualItem}
          />
        )}

        {events.length > 0 && (
          <VoiceBriefingButton
            events={events}
            items={checklistItems}
            manualItems={manualItems}
            personalTimeBlocks={personalTimeBlocks}
            forDate={selectedDate}
            weather={weather}
          />
        )}

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-primary">
                {isToday ? "Today's flow" : "Day overview"}
              </h2>
              <p className="text-[11px] text-tertiary mt-0.5">
                {eventsLoading
                  ? "Loading..."
                  : displayEvents.length === 0
                    ? "Nothing scheduled"
                    : `${displayEvents.length} ${displayEvents.length === 1 ? "item" : "items"}`}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <ICSImportButton onImported={() => loadEvents(selectedDate)} />
              <button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
                className="text-xs font-medium px-3.5 py-1.5 btn-primary flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.8} />
                Add
              </button>
            </div>
          </div>

          {eventsLoading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
            </div>
          ) : (
            <Timeline
              events={displayEvents}
              eventItems={eventItems}
              locations={locations}
              customCategories={customCategories}
              showCurrentMarker={isToday}
              onEditEvent={(e) => {
                if (e.category === "personal_time") return;
                setEditing(e);
                setShowForm(true);
              }}
              onDeleteEvent={(e) => {
                if (e.category === "personal_time") return;
                return handleDeleteEvent(e);
              }}
              onToggleComplete={(e) => {
                if (e.category === "personal_time") return;
                return handleToggleComplete(e);
              }}
              onEditNote={(e) => {
                if (e.category === "personal_time") return;
                setEditingNote(e);
              }}
            />
          )}
        </div>

        <FreeTimeFinder
          onScheduleSlot={(start, end) => {
            setPrefillSlot({ start, end });
            setEditing(null);
            setShowForm(true);
          }}
        />

        <RoutinesPanel forDate={selectedDate} />

        {isToday && (
          <EndOfDayReschedule
            events={events}
            onReschedule={handleReschedule}
            onMarkDone={async (e) => handleToggleComplete(e)}
          />
        )}

        <WeekChart startDate={selectedDate} />
      </main>

      {showForm && (
        <EventForm
          event={editing}
          initialDate={selectedDate}
          initialStart={prefillSlot?.start}
          initialEnd={prefillSlot?.end}
          locations={locations}
          customCategories={customCategories}
          onSubmit={editing ? handleUpdateEvent : handleCreateEvent}
          onDelete={editing ? handleDeleteEvent : undefined}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
            setPrefillSlot(null);
          }}
        />
      )}

      {editingNote && (
        <NoteEditor
          event={editingNote}
          onSave={async (notes, status) => {
            await fetch("/api/1/events", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: editingNote.id,
                notes,
                note_status: status,
              }),
            });
            await loadEvents(selectedDate);
          }}
          onClose={() => setEditingNote(null)}
        />
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
