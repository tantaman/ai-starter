import "../shared/env";
import { exec } from "../shared/exec";

function main() {
  console.log("Attempting to start existing ai_starter containers...");
  exec("docker compose up");
  console.log("ai_starter containers started.");
}

main();
