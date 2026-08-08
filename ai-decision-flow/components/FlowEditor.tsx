"use client";

import { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import DecisionNode from "./nodes/DecisionNode";
import ExecutionLogPanel from "./ExecutionLogPanel";
import { Button } from "./ui/button";
import { ExecutionRecord } from "@/lib/executionStore";

const nodeTypes = { decision: DecisionNode };

const initialNodes: Node[] = [
  {
    id: "1",
    type: "decision",
    position: { x: 250, y: 40 },
    data: { prompt: "Is this a support request?" },
  },
];

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [status, setStatus] = useState<string>("idle");
  const [history, setHistory] = useState<ExecutionRecord["history"]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // A connection dragged from the "yes" handle becomes a YES edge,
  // from "no" becomes a NO edge — color-coded so the graph reads at a glance.
  const onConnect = useCallback(
    (connection: Connection) => {
      const label = connection.sourceHandle === "yes" ? "YES" : "NO";
      const color = label === "YES" ? "#16a34a" : "#dc2626";
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `e-${connection.source}-${connection.sourceHandle}-${connection.target}`,
            label,
            data: { label },
            style: { stroke: color, strokeWidth: 2 },
            labelStyle: { fill: color, fontWeight: 600 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const addNode = () => {
    const id = String(Date.now());
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "decision",
        position: { x: 250, y: 100 + nds.length * 160 },
        data: { prompt: "New question..." },
      },
    ]);
  };

  // The start node is whichever node has no incoming edge — the "root" of the flow.
  const findStartNode = () => {
    const targets = new Set(edges.map((e) => e.target));
    return nodes.find((n) => !targets.has(n.id)) ?? nodes[0];
  };

  const runWorkflow = async () => {
    const start = findStartNode();
    if (!start) return;

    setStatus("pending");
    setHistory([]);
    setActiveNodeId(start.id);

    const res = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nodes: nodes.map((n) => ({ id: n.id, data: { prompt: n.data.prompt } })),
        edges: edges.map((e) => ({ source: e.source, target: e.target, data: e.data })),
        startNodeId: start.id,
      }),
    });
    const { runId } = await res.json();

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const r = await fetch(`/api/execute/status?runId=${runId}`);
      const data: ExecutionRecord = await r.json();
      setStatus(data.status);
      setHistory(data.history ?? []);
      if (data.history?.length) {
        setActiveNodeId(data.history[data.history.length - 1].nodeId);
      }
      if (data.status === "completed" || data.status === "failed") {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 1000);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        setNodes(parsed.nodes ?? []);
        setEdges(parsed.edges ?? []);
      } catch {
        alert("Invalid workflow file.");
      }
    };
    reader.readAsText(file);
  };

  // Highlight whichever node the execution log says is currently active.
  const styledNodes = nodes.map((n) => ({
    ...n,
    style:
      n.id === activeNodeId && status === "running"
        ? { boxShadow: "0 0 0 3px #6366f1", borderRadius: 8 }
        : undefined,
  }));

  return (
    <div className="flex h-screen">
      <div className="flex-1 relative">
        <div className="absolute z-10 top-3 left-3 flex gap-2 flex-wrap">
          <Button onClick={addNode}>+ Add Node</Button>
          <Button onClick={runWorkflow}>▶ Run Workflow</Button>
          <Button onClick={exportJSON} variant="outline">
            Export JSON
          </Button>
          <label className="inline-flex items-center px-3 py-1.5 text-sm border rounded-md cursor-pointer bg-white shadow-sm text-gray-700 hover:bg-gray-50">
            Import JSON
            <input type="file" accept=".json" className="hidden" onChange={importJSON} />
          </label>
        </div>

        <ReactFlowProvider>
          <ReactFlow
            nodes={styledNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <ExecutionLogPanel status={status} history={history} />
    </div>
  );
}
