# Feature Decisions: Node Task Dialog and AI Generator

## Decision Log

### 2026-05-23 -- Single-prompt generator, not conversational chatbot

**Decision:**
The AI Generate tab is a single-prompt generator with preview-and-confirm, not a multi-turn conversational chatbot.

**Reason:**
The user clarified during planning that the "chatbot" should be a single-prompt generator. A conversational interface adds significant complexity (message history, context management, streaming UI) without clear MVP value. Students need task ideas, not a conversation. The prompt → preview → confirm flow is faster and more actionable.

**Alternatives Considered:**
- Multi-turn chat with memory -- complex, requires message state management, streaming UI.
- Auto-add without preview -- risky, users want to review AI suggestions before committing.

**Consequence:**
The AI tab has three states: input, loading, preview. No message history is stored. Each generation is independent.

---

### 2026-05-23 -- Recursive ActionNode.children instead of flat task store

**Decision:**
Add `children?: ActionNode[]` directly to the `ActionNode` type, creating a recursive tree structure within the existing `StrategyPlan` data model.

**Reason:**
The simplest approach that preserves the current data model. `StrategyPlan` already contains `StrategicPillar[]`, each with `actions: ActionNode[]`. Adding `children` to `ActionNode` allows infinite nesting without introducing a separate store, separate ID namespace, or parent-child index.

**Alternatives Considered:**
- Flat task map (`Record<string, TaskNode>`) with `parentId` references -- more flexible but requires rebuilding tree for display, more complex queries.
- Separate `taskTree` store alongside `StrategyPlan` -- duplicates structure, sync issues.
- Normalized store (like Redux entities) -- overengineered for MVP.

**Consequence:**
Tree traversal is required to find/update nodes (O(n) walk), but with typical tree sizes of <100 nodes, this is negligible. The `StrategyPlan` JSON in localStorage grows with tasks but remains well under storage limits.

---

### 2026-05-23 -- Replace SelectionCard entirely, not add alongside

**Decision:**
`NodeTaskDialog` fully replaces `SelectionCard`. There is no separate "info" view vs "task" view.

**Reason:**
Having both a selection card and a task dialog would create UI confusion (which one opens when?). The task dialog includes all the information the selection card showed (name, status, description) plus the new functionality. One component, one mental model.

**Alternatives Considered:**
- Keep `SelectionCard` for info, add `NodeTaskDialog` as a separate panel -- cluttered, confusing.
- Show `SelectionCard` on hover, `NodeTaskDialog` on click -- hover popover already exists (NodePopover).

**Consequence:**
The intelligence sections from `SelectionCard` (this week, cut list, risks) need to be incorporated into `NodeTaskDialog` or dropped. For MVP: drop them from the dialog (they're available in the `IntelligenceDock`). Can be added back as a third tab later.

---

### 2026-05-23 -- Only show direct children of selected node on graph

**Decision:**
When a node is selected, only its direct children are rendered as graph nodes. Grandchildren and deeper descendants are hidden until their parent is selected.

**Reason:**
Rendering the entire recursive tree would create visual clutter and performance issues. The progressive disclosure pattern (click to expand one level) matches the user's mental model of "zooming in" to a topic. It also limits the number of Three.js objects created at any time.

**Alternatives Considered:**
- Render all descendants with decreasing opacity -- visually noisy, hard to interact with.
- Render 2 levels deep -- more context but much more complex layout math.
- Collapsible subtree visualization -- complex interaction model.

**Consequence:**
The graph layout logic only needs to handle one additional ring of nodes beyond the current pillar → action structure. Camera zoom logic from feature 010 applies the same way.

---

### 2026-05-23 -- Groq model: llama-3.3-70b-versatile

**Decision:**
Use `llama-3.3-70b-versatile` via Groq for task generation, same model used for plan generation.

**Reason:**
Consistency with existing AI integration. The 70B model produces high-quality structured output. Groq's speed (~200ms for short completions) keeps the UI responsive.

**Alternatives Considered:**
- Smaller model (8B) -- faster but lower quality task suggestions.
- Different provider (OpenAI, Anthropic) -- adds another API key dependency.

**Consequence:**
Requires `GROQ_API_KEY` environment variable. Deterministic fallback provides basic tasks when unavailable.

---

### 2026-05-23 -- ID generation with crypto.randomUUID()

**Decision:**
New `ActionNode` IDs are generated client-side using `crypto.randomUUID()`.

**Reason:**
Simple, collision-resistant, available in all modern browsers and Node.js. No server roundtrip needed for ID generation.

**Alternatives Considered:**
- Server-generated IDs -- unnecessary roundtrip for localStorage-only persistence.
- Incrementing counter -- collision risk across sessions.
- nanoid -- adds dependency for no clear benefit.

**Consequence:**
IDs are globally unique. No risk of collision when merging tasks from different sessions (future feature).

---

### 2026-05-23 -- Implementation: used timestamp+random IDs

**Decision:**
Used `task-${Date.now()}-${random}` pattern for task IDs rather than `crypto.randomUUID()`.

**Reason:**
Simpler, still collision-resistant for the expected usage volume. Timestamp prefix makes debugging easier.
