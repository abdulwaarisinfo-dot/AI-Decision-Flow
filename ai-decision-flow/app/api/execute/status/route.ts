import { NextRequest, NextResponse } from "next/server";
import { executionStore } from "@/lib/executionStore";

// Client polls this: GET /api/execute/status?runId=...
export async function GET(req: NextRequest) {
  const runId = req.nextUrl.searchParams.get("runId");
  if (!runId) {
    return NextResponse.json({ error: "runId query param required" }, { status: 400 });
  }
  const record = executionStore.get(runId);
  if (!record) {
    return NextResponse.json({ error: "run not found" }, { status: 404 });
  }
  return NextResponse.json(record);
}
