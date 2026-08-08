"use client";

import { ExecutionRecord } from "@/lib/executionStore";

export default function ExecutionLogPanel({
  status,
  history,
}: {
  status: string;
  history: ExecutionRecord["history"];
}) {
  return (
    <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto shrink-0">
      <h2 className="font-semibold text-sm mb-2 text-gray-700">Execution Log</h2>
      <div className="text-xs mb-3 text-gray-500">
        Status: <span className="font-mono">{status}</span>
      </div>

      <ol className="space-y-2">
        {history.map((h, i) => (
          <li key={i} className="text-xs bg-white border rounded p-2">
            <div className="font-medium text-gray-800">
              {i + 1}. {h.prompt}
            </div>
            <div className={h.answer === "YES" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              → {h.answer}
            </div>
          </li>
        ))}
      </ol>

      {history.length === 0 && (
        <p className="text-xs text-gray-400">
          Run the workflow to see step-by-step decisions here.
        </p>
      )}
    </div>
  );
}
