import { auth } from "@/server/auth.js";
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/mutate").methods({
  POST: ({ request }) => {
    return "not implemented yet"; // Placeholder for mutation logic
  },
});
