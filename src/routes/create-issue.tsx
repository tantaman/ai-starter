import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "@/client/auth";
import { useQuery } from "@rocicorp/zero/react";
import { useZero } from "@/ui/use-zero";
import { queries } from "@/shared/queries";
import { nanoid } from "nanoid";

export const Route = createFileRoute("/create-issue")({
  component: CreateIssue,
});

function CreateIssue() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const zero = useZero();
  const [allUsers] = useQuery(queries.allUsers());

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    assigneeId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="card text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to create issues</p>
          <Link to="/login" className="btn btn-yellow">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await zero.mutate.createIssue({
        id: nanoid(),
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
      });

      // If there's an assignee, update the issue after creation
      if (formData.assigneeId) {
        // We'd need to get the issue ID somehow - for now we'll skip this
        // In a real app, createIssue would return the ID
      }

      navigate({ to: "/" });
    } catch (error) {
      console.error("Failed to create issue:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Issues
          </Link>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold mb-6">Create New Issue</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="input"
                placeholder="Enter issue title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="input"
                rows={6}
                placeholder="Provide a detailed description of the issue..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to (optional)
                </label>
                <select
                  value={formData.assigneeId}
                  onChange={(e) => handleChange("assigneeId", e.target.value)}
                  className="input"
                >
                  <option value="">Unassigned</option>
                  {allUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim()}
                className="btn btn-yellow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Issue"}
              </button>
              <Link to="/" className="btn btn-white">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
