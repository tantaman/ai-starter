// src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useSession } from "@/client/auth";
import { LoginForm } from "@/ui/login-form";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to Chat</h1>
            <p className="text-neutral-600">
              A Slack-like chat application built with Zero, React, and TanStack Start
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">💬</div>
          <h1 className="text-4xl font-bold mb-4">Welcome to Chat</h1>
          <p className="text-neutral-600 mb-8 max-w-md">
            A real-time chat application where you can create channels, send messages, 
            and collaborate with others in real-time.
          </p>
          
          <div className="space-y-4">
            <Link 
              to="/chat"
              className="btn btn-yellow text-lg px-8 py-3 inline-block"
            >
              Start Chatting
            </Link>
            
            <div className="text-sm text-neutral-500">
              Logged in as <strong>{session.user.name}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
