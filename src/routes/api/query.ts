import { auth } from "../../server/auth";
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/query").methods({
  POST: ({ request }) => {
    return 'not implemented yet'; // Placeholder for query logic
  },
});
