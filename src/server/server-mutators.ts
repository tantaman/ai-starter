import { createMutators } from "../shared/mutators";
import { Session } from "../shared/schema";

export function createServerMutators(sess: Session | null) {
  return {
    ...createMutators(sess),

    /**
    Server mutators do not need to be pure so they can compute
    modified times, creation times, uuids, etc. 
    */
  };
}
