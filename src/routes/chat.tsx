import { createFileRoute } from "@tanstack/react-router";
import { Chat } from "@/ui/chat";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

function ChatPage() {
  return <Chat />;
}