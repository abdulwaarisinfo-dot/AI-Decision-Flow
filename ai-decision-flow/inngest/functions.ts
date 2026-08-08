import { inngest } from "./client";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { executionStore } from "@/lib/executionStore";

type FlowNode = { id: string; data: { prompt: string } };
type FlowEdge = { source: string; target: string; data: { label: "YES" | "NO" } };

export const executeWorkflow = inngest.createFunction(
  { id: "execute-decision-workflow", retries: 2 },
  { event: "workflow/execute" },
  async ({ event, step }) => {
    const { runId, nodes, edges, startNodeId } = event.data as {
      runId: string;
      nodes: FlowNode[];
      edges: FlowEdge[];
      startNodeId: string;
    };

    executionStore.set(runId, { status: "running", history: [] });

    let currentId: string | null = startNodeId;
    const visited = new Set<string>();

    while (currentId) {
      // Guard against accidental cycles in the graph.
      if (visited.has(currentId)) break;
      visited.add(currentId);

      const node = nodes.find((n) => n.id === currentId);
      if (!node) break;

      // Each node is its own Inngest step — durable, retried independently,
      // and visible as a separate step in the Inngest dev server UI.
      const answer: "YES" | "NO" = await step.run(`decide-${currentId}`, async () => {
        const response = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 5,
          system:
            "You are a strict binary classifier. Reply with exactly one word: YES or NO. No punctuation, no explanation, nothing else.",
          messages: [{ role: "user", content: node.data.prompt }],
        });
        const raw = response.content
          .filter((b) => b.type === "text")
          .map((b: any) => b.text)
          .join("")
          .trim()
          .toUpperCase();
        return raw.includes("YES") ? "YES" : "NO";
      });

      const record = executionStore.get(runId)!;
      record.history.push({ nodeId: currentId, prompt: node.data.prompt, answer });
      executionStore.set(runId, record);

      const nextEdge = edges.find((e) => e.source === currentId && e.data?.label === answer);
      currentId = nextEdge ? nextEdge.target : null;
    }

    const final = executionStore.get(runId)!;
    final.status = "completed";
    executionStore.set(runId, final);

    return { runId, history: final.history };
  }
);
