# Week Ahead Chart - Decisions

## Plain SVG, no chart library
A tiny SVG is enough for three lines and seven X positions. Adding a chart lib would dominate the bundle and force runtime CSS injection.

## Packing as a *unique* count
We dedupe items by `item_id` before counting so a category default + a one-time item with the same id only counts once. This is a quick proxy for "how heavy is the bag" rather than "how many distinct rows to render".
