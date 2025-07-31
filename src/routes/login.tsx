import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useSession } from "@/client/auth";
import { LoginForm } from "@/ui/login-form";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { data: session } = useSession();

  if (session) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-6">Bug Tracker</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}