import { createFileRoute } from "@tanstack/react-router";
import { BattleshipLobby } from "@/ui/battleship-lobby";

export const Route = createFileRoute("/battleship")({
  component: BattleshipPage,
});

function BattleshipPage() {
  return <BattleshipLobby />;
}