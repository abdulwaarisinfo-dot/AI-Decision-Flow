export type DecisionNodeData = {
  prompt: string;
  onChange?: (id: string, value: string) => void;
};

export type EdgeLabel = "YES" | "NO";
