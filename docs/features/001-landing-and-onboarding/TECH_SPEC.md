# TECH SPEC: Landing and Onboarding

## Routes

```text
app/page.tsx
app/onboarding/page.tsx
```

Both pages use the Next.js 14 App Router. The onboarding page is a client component because it manages multi-step form state.

## Components

Recommended local components:

```text
components/LoadingRoute.tsx
components/Card.tsx
components/StatusBadge.tsx
```

Onboarding can be implemented in one page for speed, or split into local step components if it stays readable.

## Data Shape

Submit this payload to `POST /api/generate`:

```ts
{
  profile: {
    degree: string;
    year: string;
    university: string;
    targetGoal: string;
    courses: string[];
    commitments: string[];
    workHoursPerWeek: number;
    constraints: string;
    brainDump: string;
  }
}
```

Comma-separated inputs may be converted with:

```ts
value.split(",").map((item) => item.trim()).filter(Boolean)
```

## Implementation Architecture

- Keep form state local with `useState`.
- Keep current step index local with `useState`.
- Validate required fields before moving forward.
- On submit, set `isGenerating`.
- Start a timed loading-step animation while the request is in flight.
- Call `fetch("/api/generate", { method: "POST", body: JSON.stringify({ profile }) })`.
- On success, use `router.push(`/dashboard/${planId}`)`.
- On failure, show a persistent error panel with a demo link.

## Styling

- Use global CSS variables from `styles/globals.css`.
- Dark premium background: `--bg-base`.
- Form panels: `--bg-surface`, `--border`.
- Primary CTA: `--accent`.
- Error CTA: include demo escape hatch.

## Accessibility

- Use real `<label>` elements.
- Use semantic `<button>` elements.
- Keep step navigation keyboard accessible.
- Do not rely only on placeholder text.

