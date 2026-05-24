# Feature PRD: Node Task Dialog and AI Generator

## Status
Complete

## Summary

Replace the current `SelectionCard` with a richer tabbed dialog that opens when any node (pillar or action) is clicked. Tab 1 shows the node's task list with checkboxes and a manual "add task" button. Tab 2 is a single-prompt AI task generator powered by Groq that creates new tasks. Generated or manually added tasks appear as new child nodes on the graph, and clicking any child node opens the same tabbed dialog -- enabling infinite recursive task expansion.

## User Problem

The current selection card shows a pillar's actions as a flat list with checkboxes and some intelligence context (this week, cut list, risks). Users can't add new tasks, can't use AI to brainstorm tasks, and can't break tasks into subtasks. The graph is read-only in terms of structure. Students need the ability to customize their strategy: adding tasks they think of, using AI to generate task ideas, and drilling into tasks to create subtask trees.

## User Story

As a student viewing my strategy map, I want to click on a pillar and see a dialog where I can:
1. View and check off my existing tasks.
2. Click "+" to manually type and add a new task.
3. Switch to an "AI Generate" tab, describe what I need help with, and receive a list of suggested tasks that I can confirm and add to my plan.
4. See those new tasks appear as nodes on my graph.
5. Click on any task node and repeat this process -- creating subtasks, sub-subtasks, etc.

As a hackathon judge, I want to see the AI-powered task generation create a "living, breathing" strategy map that grows organically with user interaction.

## UX Flow

### Opening the Dialog
1. User clicks a pillar or action node on the graph.
2. A dialog slides up from the bottom (same position as current `SelectionCard`).
3. Dialog has two tabs: **Tasks** and **AI Generate**.

### Tab 1: Tasks
- Shows the node's name, status badge, and description at the top.
- Lists all child tasks with checkboxes (done/open state).
- Each task row has a subtle "expand" icon -- clicking it selects that task node on the graph (which opens the same dialog for that task).
- At the bottom: a "+" button that expands into an inline text input. User types a task name, presses Enter, and the task is added immediately.
- New tasks get status "On Track" and a default recommendation.

### Tab 2: AI Generate
- A text input with placeholder: "Describe what you need help with..."
- A "Generate" button.
- On submit: calls `POST /api/node/tasks` with the node context and user prompt.
- Shows a loading spinner while waiting.
- Groq returns a list of 3–6 suggested tasks.
- Tasks appear as a preview list with checkboxes (all checked by default).
- User can uncheck any they don't want.
- A "Add selected tasks" button confirms and adds them.
- This is NOT a conversational chatbot. It's a single-prompt generator with preview-and-confirm.

### Task → Node Expansion
- When tasks are added (manually or via AI), they become new `ActionNode` entries in the data model.
- On the graph, new child nodes appear connected to the parent node with edges.
- Clicking any child node opens the same tabbed dialog, starting the cycle again.
- There is no depth limit -- recursion is infinite.

### Recursive Data Model
- `ActionNode` gains an optional `children: ActionNode[]` field.
- The graph layout function needs to handle nested nodes.
- For display, only the currently selected node's direct children are shown as graph nodes. Deeper descendants are hidden until their parent is selected.

## Requirements

### Must Have
- [ ] Tabbed dialog component replacing `SelectionCard` with two tabs: Tasks and AI Generate.
- [ ] Tasks tab: list with checkboxes, expand-to-node button, manual add via "+" button.
- [ ] AI Generate tab: single text input, generate button, loading state, preview list, confirm button.
- [ ] `POST /api/node/tasks` API endpoint that calls Groq with node context and user prompt.
- [ ] Groq prompt that generates 3–6 actionable tasks given a node's name, description, and parent context.
- [ ] Deterministic fallback when Groq is unavailable (return generic tasks based on node name).
- [ ] New tasks added to the data model and persisted in localStorage.
- [ ] New tasks rendered as child nodes on the graph with connecting edges.
- [ ] Clicking a child node opens the same tabbed dialog (recursive).
- [ ] Dialog accessible: focus trap, keyboard navigation, Escape to close.

### Nice to Have
- [ ] Drag-to-reorder tasks in the list.
- [ ] Delete task (with confirmation).
- [ ] Edit task name inline.
- [ ] Collapse/expand subtree on the graph.
- [ ] Task status auto-calculation (parent "done" when all children "done").

### Out of Scope
- Multi-turn conversational AI (single prompt only).
- Server-side persistence (all state in localStorage for MVP).
- Undo/redo for task operations.
- Graph layout for deeply nested trees (limit visible depth to 2 levels from selected node for performance).

## API Design

### `POST /api/node/tasks`

**Request:**
```json
{
  "nodeId": "pillar-academics",
  "nodeName": "Academics",
  "nodeDescription": "Course performance and academic strategy",
  "parentContext": "B.Sc. Computer Science",
  "userPrompt": "I need help preparing for my algorithms final exam"
}
```

**Response:**
```json
{
  "tasks": [
    {
      "name": "Review all lecture notes on graph algorithms",
      "recommendation": "Start with BFS/DFS, then move to shortest paths and MST."
    },
    {
      "name": "Complete 3 past exam papers under timed conditions",
      "recommendation": "Focus on time management. Aim for 80% completion in allotted time."
    },
    {
      "name": "Form a study group for algorithm problem-solving",
      "recommendation": "Meet 2-3 times before the exam. Each person presents one topic."
    }
  ]
}
```

**Groq prompt structure:**
```
System: You are a strategic academic advisor. Given a student's goal context and a specific area they need help with, generate 3-6 concrete, actionable tasks. Each task should have a name (short, action-oriented) and a recommendation (1-2 sentence guidance). Return JSON only.

User: Goal: {parentContext}. Area: {nodeName} - {nodeDescription}. Student's request: {userPrompt}
```

## Success Criteria

- [ ] Clicking any pillar or action node opens the tabbed dialog.
- [ ] Tasks tab shows existing tasks with working checkboxes.
- [ ] Manual task addition via "+" creates a task and a graph node.
- [ ] AI Generate tab sends a prompt and receives task suggestions.
- [ ] Confirming AI tasks adds them to the data model and graph.
- [ ] Clicking a newly added task node opens the same dialog (recursion works).
- [ ] Dialog is keyboard accessible (Tab, Escape, Enter).
- [ ] Deterministic fallback works when Groq is unavailable.
- [ ] State persists across page reloads (localStorage).
