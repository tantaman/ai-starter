import { concurrently } from "concurrently";
import "../shared/env";

concurrently([
  {
    command: "pnpm run dev:docker",
    name: "🐳",
    prefixColor: "#32648c",
  },
  { command: "pnpm run dev:web", name: "🕸️", prefixColor: "#7ce645" },
]);
