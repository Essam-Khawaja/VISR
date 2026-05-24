# Clickable Links - Tech Spec

## Util
`src/lib/linkify.tsx` exports `renderTextWithLinks(text: string): React.ReactNode[]`. Splits the input on a URL regex, normalises `www.` to `https://`, strips trailing punctuation, and wraps matches in styled anchor tags (`stopPropagation` on click so they don't bubble to a parent edit handler).

## Usage
- `TimelineEvent.tsx` uses it inside the note preview *div* (not `<button>`) and the description paragraph.
- `notes/page.tsx` uses it for the body of every saved note.

## Why a div, not a button
Anchor tags nested in a `<button>` is invalid HTML and breaks click handling. The note preview is now a div with `cursor-pointer` and an outer onClick that opens the editor; the anchor's `stopPropagation` prevents the editor from also opening.
