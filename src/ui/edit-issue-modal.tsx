import { useState } from "react";
import { useSession } from "@/client/auth.js";
import { queries } from "@/shared/queries.js";
import { useQuery, useZero } from "@/ui/use-zero.js";

interface EditIssueModalProps {
  issue: any;
  onClose: () => void;
}

export function EditIssueModal({ issue, onClose }: EditIssueModalProps) {
  const zero = useZero();
  const { data: session } = useSession();
  const [teamStatuses] = useQuery(queries.teamIssueStatuses(session, issue.teamId));
  const [teamPriorities] = useQuery(queries.teamIssuePriorities(session, issue.teamId));
  const [teamProjects] = useQuery(queries.teamProjects(session, issue.teamId));
  const [teamMembers] = useQuery(queries.teamMembers(session, issue.teamId));
  
  const [formData, setFormData] = useState({
    title: issue.title || "",
    description: issue.description || "",
    statusId: issue.statusId || "",
    priorityId: issue.priorityId || "",
    projectId: issue.projectId || "",
    assigneeId: issue.assigneeId || "",
    estimate: issue.estimate?.toString() || "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await zero.mutate.updateIssue({
        id: issue.id,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        statusId: formData.statusId || undefined,
        priorityId: formData.priorityId || undefined,
        projectId: formData.projectId || undefined,
        assigneeId: formData.assigneeId || undefined,
        estimate: formData.estimate ? parseInt(formData.estimate) : undefined,
      });

      onClose();
    } catch (err) {
      console.error("Failed to update issue:", err);
      setError("Failed to update issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Edit Issue</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              className="input w-full"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the issue..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Status
              </label>
              <select
                className="input w-full"
                value={formData.statusId}
                onChange={(e) => setFormData(prev => ({ ...prev, statusId: e.target.value }))}
              >
                <option value="">Select status</option>
                {teamStatuses?.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Priority
              </label>
              <select
                className="input w-full"
                value={formData.priorityId}
                onChange={(e) => setFormData(prev => ({ ...prev, priorityId: e.target.value }))}
              >
                <option value="">No priority</option>
                {teamPriorities?.map(priority => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Project
              </label>
              <select
                className="input w-full"
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
              >
                <option value="">No project</option>
                {teamProjects?.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Assignee
              </label>
              <select
                className="input w-full"
                value={formData.assigneeId}
                onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {teamMembers?.map(member => (
                  <option key={member.userId} value={member.userId}>
                    {member.user?.name || member.user?.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Estimate (hours)
              </label>
              <input
                type="number"
                className="input w-full"
                value={formData.estimate}
                onChange={(e) => setFormData(prev => ({ ...prev, estimate: e.target.value }))}
                placeholder="0"
                min="0"
                max="999"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-default"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}