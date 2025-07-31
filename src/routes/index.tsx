// src/routes/index.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "@/client/auth";
import { useQuery } from "@rocicorp/zero/react";
import { useZero } from "@/ui/use-zero";
import { queries } from "@/shared/queries";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [filter, setFilter] = useState<"all" | "open" | "mine" | "assigned">(
    "all"
  );
  const { data: session } = useSession();
  const zero = useZero();

  const [allIssues] = useQuery(queries.allIssues());
  const [openIssues] = useQuery(queries.openIssues());
  const [myIssues] = useQuery(queries.myIssues(session));
  const [assignedIssues] = useQuery(queries.assignedToMe(session));

  const issues =
    filter === "all"
      ? allIssues
      : filter === "open"
      ? openIssues
      : filter === "mine"
      ? myIssues
      : assignedIssues;

  console.log("Issues fetched:", issues);

  const handleCreateIssue = () => {
    // This will be handled by the create-issue route
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-blue-600 bg-blue-50";
      case "in_progress":
        return "text-purple-600 bg-purple-50";
      case "closed":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="card text-center">
          <h1 className="text-2xl font-bold mb-4">Bug Tracker</h1>
          <p className="text-gray-600 mb-4">
            Please sign in to access the bug tracker
          </p>
          <Link to="/login" className="btn btn-yellow">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-white border border-black p-3 flex flex-col gap-2 rounded-xl m-3 shadow-[2px_2px_0_#00000020]">
        <div className="text-xl font-extrabold tracking-tight mb-3">
          Bug Tracker
        </div>
        <nav className="flex flex-col divide-y divide-neutral-200">
          <button
            className={`nav-btn ${filter === "all" ? "bg-neutral-100" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Issues ({allIssues.length})
          </button>
          <button
            className={`nav-btn ${filter === "open" ? "bg-neutral-100" : ""}`}
            onClick={() => setFilter("open")}
          >
            Open Issues ({openIssues.length})
          </button>
          <button
            className={`nav-btn ${filter === "mine" ? "bg-neutral-100" : ""}`}
            onClick={() => setFilter("mine")}
          >
            My Issues ({myIssues.length})
          </button>
          <button
            className={`nav-btn ${
              filter === "assigned" ? "bg-neutral-100" : ""
            }`}
            onClick={() => setFilter("assigned")}
          >
            Assigned to Me ({assignedIssues.length})
          </button>
        </nav>
        <div className="mt-auto">
          <Link
            to="/create-issue"
            className="btn btn-yellow w-full mb-2 block text-center"
          >
            New Issue
          </Link>
          <div className="text-xs text-neutral-400">
            Welcome, {session.user.name}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              {filter === "all"
                ? "All Issues"
                : filter === "open"
                ? "Open Issues"
                : filter === "mine"
                ? "My Issues"
                : "Assigned to Me"}
            </h1>
            <div className="text-sm text-gray-500">
              {issues.length} {issues.length === 1 ? "issue" : "issues"}
            </div>
          </div>

          <div className="space-y-3">
            {issues.length === 0 ? (
              <div className="card text-center py-8">
                <div className="text-gray-500">No issues found</div>
                <Link to="/create-issue" className="btn btn-yellow mt-4">
                  Create First Issue
                </Link>
              </div>
            ) : (
              issues.map((issue) => (
                <Link
                  key={issue.id}
                  to="/issue/$id"
                  params={{ id: issue.id }}
                  className="card block hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs rounded font-medium ${getPriorityColor(
                            issue.priority
                          )}`}
                        >
                          {issue.priority}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(
                            issue.status
                          )}`}
                        >
                          {issue.status.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">
                        {issue.title}
                      </h3>
                      {issue.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {issue.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Reporter: {issue.reporter?.name}</span>
                        {issue.assignee && (
                          <span>Assignee: {issue.assignee.name}</span>
                        )}
                        <span>
                          Created:{" "}
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
