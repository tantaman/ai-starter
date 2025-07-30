import { CustomMutatorDefs } from "@rocicorp/zero";
import { schema, Session } from "./schema.js";

export function createMutators(sess: Session | null) {
  return {
    // Add your mutator definitions here
    // Example:
    // createIssue(tx, {id, title, description}) {
    //   if (!sess) throw new Error("Not authenticated");
    //   await tx.issue.insert({ id, title, description });
    // }
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
