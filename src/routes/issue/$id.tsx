import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "@/client/auth";
import { useQuery } from "@rocicorp/zero/react";
import { useZero } from "@/ui/use-zero";
import { queries } from "@/shared/queries";
import { nanoid } from "nanoid";

export const Route = createFileRoute("/issue/$id")({
  component: IssueDetail,
});

function IssueDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const zero = useZero();
  const [newComment, setNewComment] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");

  const [issue] = useQuery(queries.issueById(session, id));
  const [allUsers] = useQuery(queries.allUsers());

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="card text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to view issues</p>
          <Link to="/login" className="btn btn-yellow">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="card text-center">
          <h1 className="text-2xl font-bold mb-4">Issue Not Found</h1>
          <Link to="/" className="btn btn-yellow">
            Back to Issues
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdateStatus = (status: "open" | "closed" | "in_progress") => {
    zero.mutate.updateIssue({ id, status });
  };

  const handleUpdatePriority = (
    priority: "low" | "medium" | "high" | "critical"
  ) => {
    zero.mutate.updateIssue({ id, priority });
  };

  const handleAssign = (assigneeId: string | null) => {
    zero.mutate.updateIssue({ id, assigneeId });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      zero.mutate.createComment({
        id: nanoid(),
        issueId: id,
        content: newComment.trim(),
      });
      setNewComment("");
    }
  };

  const handleEdit = () => {
    setEditTitle(issue.title);
    setEditDescription(issue.description || "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    zero.mutate.updateIssue({
      id,
      title: editTitle,
      description: editDescription || undefined,
    });
    setIsEditing(false);
  };

  const handleDeleteIssue = () => {
    if (confirm("Are you sure you want to delete this issue?")) {
      zero.mutate.deleteIssue({ id });
      navigate({ to: "/" });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "in_progress":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "closed":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Issues
          </Link>
        </div>

        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input text-2xl font-bold"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="input"
                    rows={4}
                    placeholder="Issue description..."
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="btn btn-yellow">
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn btn-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold mb-3">{issue.title}</h1>
                  {issue.description && (
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                      {issue.description}
                    </p>
                  )}
                </>
              )}
            </div>

            {!isEditing && (
              <div className="flex gap-2 ml-4">
                <button onClick={handleEdit} className="btn btn-white text-sm">
                  Edit
                </button>
                <button
                  onClick={handleDeleteIssue}
                  className="btn btn-white text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={issue.status}
                onChange={(e) => handleUpdateStatus(e.target.value as any)}
                className="input"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={issue.priority}
                onChange={(e) => handleUpdatePriority(e.target.value as any)}
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
                Assignee
              </label>
              <select
                value={issue.assigneeId || ""}
                onChange={(e) => handleAssign(e.target.value || null)}
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

          <div className="mt-4 pt-4 border-t text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>Reporter: {issue.reporter?.name}</span>
              <span>Created: {new Date(issue.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(issue.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">
            Comments ({issue.comments?.length || 0})
          </h2>

          <div className="space-y-4 mb-6">
            {issue.comments?.map((comment) => (
              <div
                key={comment.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{comment.author?.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="input"
              rows={3}
              required
            />
            <button type="submit" className="btn btn-yellow">
              Add Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
