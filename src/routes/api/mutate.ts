import { auth } from "@/server/auth.js";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { schema } from "@/shared/schema.js";
import { PushProcessor } from "@rocicorp/zero/server";
import { zeroPostgresJS } from "@rocicorp/zero/server/adapters/postgresjs";
import { must } from "@/shared/util/must";
import { createMutators } from "../../shared/mutators";

const processor = new PushProcessor(
  zeroPostgresJS(schema, must(process.env.PG_URL))
);

export const ServerRoute = createServerFileRoute("/api/mutate").methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const mutators = createMutators(session);
    const result = await processor.process(mutators, request);

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
});
