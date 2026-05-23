# API Spec

## Endpoints / Server Actions

### `GET /api/events`
Returns events for a given date range.

**Query Params:** `date` (ISO date string, defaults to today)

**Response:**
```ts
type Response = TimelineEvent[];
```

### `POST /api/events`
Creates a new event.

**Request:**
```ts
type Request = Omit<TimelineEvent, "id" | "created_at">;
```

**Response:**
```ts
type Response = TimelineEvent;
```

### `PATCH /api/events`
Updates an existing event.

**Request:**
```ts
type Request = { id: string } & Partial<TimelineEvent>;
```

### `DELETE /api/events`
Deletes an event by ID.

**Query Params:** `id` (uuid)

---

### `GET /api/items`
Returns all items.

**Response:**
```ts
type Response = Item[];
```

### `POST /api/items`
Creates a new item.

**Request:**
```ts
type Request = { name: string; icon?: string };
```

---

### `GET /api/event-items?event_id=xxx`
Returns items attached to a specific event.

### `POST /api/event-items`
Attaches an item to an event.

**Request:**
```ts
type Request = { event_id: string; item_id: string; is_one_time?: boolean };
```

### `DELETE /api/event-items`
Removes an item from an event.

**Query Params:** `id` (uuid)

---

### `GET /api/category-defaults?category=xxx`
Returns default items for a category.

### `POST /api/category-defaults`
Adds a default item to a category.

### `DELETE /api/category-defaults`
Removes a default item from a category.

---

### `GET /api/weather`
Fetches weather for a city.

**Query Params:** `city`, `country`

**Response:**
```ts
type Response = WeatherData;
```

---

### `GET /api/free-time`
Finds free time slots for a given date.

**Query Params:** `date`, `min_minutes`

**Response:**
```ts
type Response = FreeSlot[];
```

## Errors
- 400: Bad request / missing parameters
- 404: Resource not found
- 500: Internal server error
