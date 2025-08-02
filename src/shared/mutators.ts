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
    // If you need to perform complex permission checks server side for a mutator,
    // 1. add the unpermissioned mutator here
    // 2. add the permissioned mutator in src/server/server-mutators.ts
    // The mutator on the server can be async and call whatever you like.
    // It can even be non-deterministic, like generating a random ID.
    // To share code, the server mutator can call the mutator defined here.
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
