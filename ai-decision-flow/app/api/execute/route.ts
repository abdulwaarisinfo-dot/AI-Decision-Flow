import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { inngest } from "@/inngest/client";
import { executionStore } from "@/lib/executionStore";

// Fires the event and returns instantly (202) — same accept-fast /
// work-in-background pattern as the earlier background-job assignment.
export async function POST(req: NextRequest) {
  const { nodes, edges, startNodeId } = await req.json();

  if (!nodes?.length || !startNodeId) {
    return NextResponse.json({ error: "nodes and startNodeId are required" }, { status: 400 });
  }

  const runId = randomUUID();
  executionStore.set(runId, { status: "pending", history: [] });

  await inngest.send({
    name: "workflow/execute",
    data: { runId, nodes, edges, startNodeId },
  });

  return NextResponse.json({ runId, status: "pending" }, { status: 202 });
}
