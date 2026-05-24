export const EVENT_CATEGORIES = [
  "class",
  "meeting",
  "assignment",
  "project",
  "club",
  "transit",
  "grocery",
  "gym",
  "break",
  "personal",
  "personal_time",
  "social",
  "errand",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export type NoteStatus =
  | "unresolved"
  | "follow_up"
  | "completed"
  | "important"
  | null;

export type TimelineEvent = {
  id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  start_time: string;
  end_time: string;
  location: string | null;
  location_id: string | null;
  auto_transit: boolean;
  is_recurring: boolean;
  recurrence_rule: string | null;
  notes: string | null;
  note_status: NoteStatus;
  completed: boolean;
  created_at: string;
};

export type Item = {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
};

export type EventItem = {
  id: string;
  event_id: string;
  item_id: string;
  is_one_time: boolean;
};

export type CategoryDefaultItem = {
  id: string;
  category: string;
  item_id: string;
};

export const LOCATION_TYPES = [
  "university",
  "work",
  "home",
  "gym",
  "grocery",
  "other",
] as const;

export type LocationType = (typeof LOCATION_TYPES)[number];

export type SavedLocation = {
  id: string;
  name: string;
  address: string | null;
  location_type: LocationType | null;
  transit_minutes: number;
  created_at: string;
};

export type UserSettings = {
  id: string;
  city: string;
  country: string;
  country_code: string;
  timezone: string;
  wake_time: string;
  sleep_time: string;
  created_at: string;
};

export type WeatherData = {
  temp: number;
  feels_like: number;
  description: string;
  icon: string;
  rain_probability: number;
  snow: boolean;
  wind_speed: number;
  humidity: number;
  is_forecast?: boolean;
};

export type WeatherAdvice = {
  message: string;
  item: string | null;
  severity: "info" | "warning";
};

export type FreeSlot = {
  start: string;
  end: string;
  duration_minutes: number;
};

export type EventWithItems = TimelineEvent & {
  items: Item[];
};

export type ChecklistItem = {
  item: Item;
  source: "category_default" | "event_specific" | "weather" | "manual";
  event_title?: string;
  event_titles?: string[];
  manual_id?: string;
  checked: boolean;
  /** Past-event or past-day item: shown grayed out and not toggleable */
  locked?: boolean;
};

export type CityResult = {
  name: string;
  state?: string;
  country: string;
  country_code: string;
  lat: number;
  lon: number;
};

export const ROUTINE_FREQUENCIES = [
  "daily",
  "weekly",
  "monthly",
  "every_n_days",
] as const;

export type RoutineFrequency = (typeof ROUTINE_FREQUENCIES)[number];

export type Routine = {
  id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  frequency: RoutineFrequency;
  interval_days: number;
  preferred_time: string | null;
  last_completed: string | null;
  next_due: string | null;
  ends_on: string | null;
  active: boolean;
  created_at: string;
};

export type CustomCategory = {
  id: string;
  name: string;
  label: string;
  created_at: string;
};

export type PersonalTimeBlock = {
  id: string;
  label: string;
  weekday: number | null;
  specific_date: string | null;
  start_time: string;
  end_time: string;
  active: boolean;
  created_at: string;
};

export type ManualChecklistItem = {
  id: string;
  item_name: string;
  for_date: string;
  checked: boolean;
  created_at: string;
};
