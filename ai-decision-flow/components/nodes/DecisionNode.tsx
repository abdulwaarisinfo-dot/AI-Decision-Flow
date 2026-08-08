"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { useState } from "react";

export default function DecisionNode({ id, data, selected }: NodeProps) {
  const [prompt, setPrompt] = useState(data.prompt ?? "");

  return (
    <div
      className={`rounded-lg border-2 bg-white shadow-md p-3 w-64 ${
        selected ? "border-indigo-500" : "border-gray-200"
      }`}
    >
      <Handle type="target" position={Position.Top} />

      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
        Decision Node
      </div>

      <textarea
        className="w-full text-sm border rounded p-2 resize-none nodrag focus:outline-none focus:ring-2 focus:ring-indigo-400"
        rows={3}
        value={prompt}
        placeholder="e.g. Is this a support request?"
        onChange={(e) => {
          setPrompt(e.target.value);
          data.prompt = e.target.value;
          data.onChange?.(id, e.target.value);
        }}
      />

      <div className="flex justify-between mt-2 text-[10px] font-semibold">
        <span className="text-green-600">YES →</span>
        <span className="text-red-600">NO →</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: "30%", background: "#16a34a", width: 10, height: 10 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: "70%", background: "#dc2626", width: 10, height: 10 }}
      />
    </div>
  );
}
