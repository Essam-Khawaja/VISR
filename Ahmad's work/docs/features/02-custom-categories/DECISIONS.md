# Custom Categories - Decisions

## Drop CHECK constraints rather than maintain an enum
Maintaining a Postgres enum that mirrors `EVENT_CATEGORIES` would require migrations every time the user adds a category. Instead the column is plain `text`; the union in TS narrows the *builtins* but `string` is accepted elsewhere.

## Generic fallback icon/style
Picking colors per category is a rabbit hole. A neutral stone styling + `Tag` icon for unknowns keeps the UI consistent and is good enough for demo.
