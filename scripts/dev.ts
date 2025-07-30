import { concurrently } from "concurrently";
import "../env.js";
import { must } from "../src/shared/util/must.js";

const pgAddress = must(process.env.PG_ADDRESS, "PG_ADDRESS is required");

concurrently([
  {
    command: "pnpm run dev:docker",
    name: "🐳",
    prefixColor: "#32648c",
  },
  { command: "pnpm run dev:web", name: "🕸️", prefixColor: "#7ce645" },
  { command: "pnpm run dev:proxy", name: "🫣", prefixColor: "#ff00cc" },
  {
    command: `wait-on tcp:${pgAddress} && sleep 1 && pnpm run dev:zero`,
    name: "🚰",
    prefixColor: "#ff11cc",
  },
  {
    command: "chokidar './src/db/schema.ts' -c 'pnpm run gen-schema'",
    name: "👨‍💻",
    prefixColor: "#11ffcc",
  },
]);
