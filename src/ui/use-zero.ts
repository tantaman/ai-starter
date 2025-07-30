import { createUseZero } from "@rocicorp/zero/react";
import type { Schema } from "@/shared/schema.js";
import type { Mutators } from "@/shared/mutators.js";
export const useZero = createUseZero<Schema, Mutators>();
