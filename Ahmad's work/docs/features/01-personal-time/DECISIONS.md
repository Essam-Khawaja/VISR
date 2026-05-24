# Personal Time Blocks - Decisions

## Phantom events instead of a parallel render path
We expand each block into a synthetic `TimelineEvent` and merge into the existing event list rather than building a second renderer. Consequence: the timeline, week view, and free-time finder all "see" them with zero new rendering code.

## Reserve `personal_time` as an internal category
Adding it to `EVENT_CATEGORIES` keeps types tight; the EventForm picker filters it out so users never accidentally create a normal event in this category.
