import { Inngest } from "inngest";

// A single shared Inngest client — every function and event uses this id.
export const inngest = new Inngest({ id: "ai-decision-flow" });
