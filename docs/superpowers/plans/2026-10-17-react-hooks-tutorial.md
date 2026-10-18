# React Hooks Beginner Tutorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a practical beginner tutorial that explains the industry-common React Hooks and how to choose them.

**Architecture:** Add one standalone Markdown tutorial in the repository documentation. It will teach the core Hooks through a small expense-list example, use short TypeScript examples, and include a decision-flow diagram plus a concise reference for less common Hooks.

**Tech Stack:** Markdown, Mermaid, React 19 Hooks API, TypeScript/TSX examples.

**Spec:** User-approved in-chat design: beginner-oriented, practical tutorial with a Hook-selection visual.

## Global Constraints

- Base factual claims on the official React Hooks reference.
- Prioritize `useState`, `useEffect`, `useContext`, `useRef`, `useMemo`, `useCallback`, `useReducer`, and `useTransition`.
- Explain effects as synchronization with external systems, rather than ordinary application data flow.
- Do not modify application source code or unrelated user changes.

## Review Focus

- A reader can distinguish state (renders) from refs (do not render).
- A reader sees when an Effect is unnecessary and has an alternative.
- Performance Hooks are presented as measured optimizations, not default boilerplate.
- Examples use valid function-component Hook placement and dependency arrays.
- The decision flow gives one clear first choice for common situations.

---

### Task 1: Author the tutorial

**Files:**
- Create: `docs/react-hooks-beginner-tutorial.md`

**Interfaces:**
- Consumes: The official React Hooks reference and the tutorial scope above.
- Produces: A self-contained Markdown tutorial readable without project context.

- [x] **Step 1: Outline the learning path**

Start with the Rules of Hooks, then introduce state, effects, context, refs, reducer, memoization, callback memoization, and transitions in increasing complexity.

- [x] **Step 2: Add practical TypeScript examples**

Use a small expense-list or transaction-management scenario. Each common Hook section must have: purpose, “use it when”, a short example, and a “watch out for” note.

- [x] **Step 3: Add a Hook-selection Mermaid decision flow**

Include a labeled flowchart that directs common needs to the relevant Hook or an alternative, including the “you might not need an Effect” branch.

- [x] **Step 4: Add an advanced/less-common reference section**

Briefly identify `useId`, `useSyncExternalStore`, `useImperativeHandle`, `useLayoutEffect`, `useInsertionEffect`, `useEffectEvent`, `useActionState`, and `useDebugValue`; make clear these are not everyday application defaults.

- [x] **Step 5: Verify the document**

Run: `Get-Content -Raw docs/react-hooks-beginner-tutorial.md`

Expected: All requested common Hooks, selection flow, and cautions are present; no unfinished placeholders.
