export type ExecutionStep = {
  nodeId: string;
  prompt: string;
  answer: "YES" | "NO";
};

export type ExecutionRecord = {
  status: "pending" | "running" | "completed" | "failed";
  history: ExecutionStep[];
  error?: string;
};

// In-memory store — fine for local dev / a single process.
// Swap for Redis or a DB table if you ever run multiple server instances,
// same idea as the BE-06 job store.
export const executionStore = new Map<string, ExecutionRecord>();
