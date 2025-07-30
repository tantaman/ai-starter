import { auth } from "@/server/auth.js";
import { AnyQuery, ReadonlyJSONValue } from "@rocicorp/zero";
import { getQueries } from "@rocicorp/zero/server";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { queries } from "@/shared/queries.js";
import { Session, schema } from "@/shared/schema.js";

export const ServerRoute = createServerFileRoute("/api/query").methods({
  POST: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const result = await getQueries(
      async (name, args) => ({
        query: getQuery(session, name, args),
      }),
      schema,
      request
    );

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
});

function isQuery(key: string): key is keyof typeof queries {
  return key in queries;
}

export function getQuery(
  context: Session | null,
  name: string,
  args: readonly ReadonlyJSONValue[]
) {
  let query;
  if (isQuery(name)) {
    query = (
      queries[name] as (
        context: Session | null,
        ...args: readonly ReadonlyJSONValue[]
      ) => AnyQuery
    )(context, ...args);
  } else {
    throw new Error(`Unknown query: ${name}`);
  }

  return query;
}
