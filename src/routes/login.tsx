import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/ui/login-form";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">BookMe</h1>
          <p className="text-neutral-600">Sign in to manage your bookings</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}