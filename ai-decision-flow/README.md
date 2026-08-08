# AI Decision Flow

A visual AI workflow builder: draw a graph of YES/NO decision nodes with **React Flow**,
run it through **Inngest**, and each node's answer comes from a real LLM call (OpenAI).

## What's here (Phases 1–3 + a few Phase 4 stretch items)

- ✅ Next.js (App Router) + TypeScript + Tailwind
- ✅ React Flow canvas — add nodes, drag connections, edit prompts inline
- ✅ YES / NO edges (color-coded: green = YES, red = NO)
- ✅ Inngest function that walks the graph node by node, calling OpenAI at each step
- ✅ `POST /api/execute` → returns `202` + a `runId` instantly (background pattern)
- ✅ `GET /api/execute/status?runId=...` → poll for live status + step-by-step history
- ✅ Execution log panel (Phase 4 stretch: **Execution logs panel**)
- ✅ Active-node highlighting while running (Phase 4 stretch: **Visual execution state**)
- ✅ JSON export/import of the whole graph (Phase 4 stretch: **JSON export/import**)

Not included yet (pick these up for further Phase 4 polish): save/load to a database,
retry-failed-node UI, animated edges, full execution history across multiple runs.

## Setup

```bash
npm install
cp .env.example .env.local
# then fill in OPENAI_API_KEY in .env.local
```

## Run it (two terminals)

**Terminal 1 — the app:**
```bash
npm run dev
```
Opens at http://localhost:3000

**Terminal 2 — the Inngest dev server:**
```bash
npm run inngest
```
Opens the Inngest dashboard at http://localhost:8288 — this is where you can watch each
node execute as a separate, durable step in real time.

## How it works

1. Add nodes on the canvas, each with a yes/no question as its prompt.
2. Drag a connection from a node's **green (YES)** or **red (NO)** handle to the next node.
3. Hit **Run Workflow**. This POSTs to `/api/execute`, which fires an Inngest event and
   returns immediately.
4. The Inngest function (`inngest/functions.ts`) walks the graph: for the current node,
   it asks OpenAI the prompt and forces a YES/NO-only answer, then follows the matching
   edge to the next node — until there's no matching edge left.
5. The frontend polls `/api/execute/status` once a second and shows each decision as it
   completes, highlighting the currently active node on the canvas.

## Example graph

```
"Is this a support request?"
   YES → "Is it urgent?"
            YES → Escalate Node
            NO  → Standard Queue Node
   NO  → "Is it a sales inquiry?"
            YES → Sales Node
            NO  → General Node
```
