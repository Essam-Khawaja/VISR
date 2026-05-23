# Data Model

## Entities

### TimelineEvent
```ts
type TimelineEvent = {
  id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  start_time: string;
  end_time: string;
  location: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  notes: string | null;
  completed: boolean;
  created_at: string;
};
```

### Item
```ts
type Item = {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
};
```

### EventItem
```ts
type EventItem = {
  id: string;
  event_id: string;
  item_id: string;
  is_one_time: boolean;
};
```

### CategoryDefaultItem
```ts
type CategoryDefaultItem = {
  id: string;
  category: EventCategory;
  item_id: string;
};
```

### UserSettings
```ts
type UserSettings = {
  id: string;
  city: string;
  country_code: string;
  timezone: string;
  wake_time: string;
  created_at: string;
};
```

## Relationships
- An Event has many Items (through event_items join table)
- A Category has many default Items (through category_default_items)
- UserSettings is a single-row table for MVP

## Storage
- All data stored in Supabase PostgreSQL
- Schema defined in `supabase-schema.sql` at project root
