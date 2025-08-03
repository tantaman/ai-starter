import { useState } from "react";
import { useSession } from "@/client/auth.js";
import { queries } from "@/shared/queries.js";
import { useQuery, useZero } from "@/ui/use-zero.js";

interface CreateProjectModalProps {
  teamId: string;
  onClose: () => void;
}

export function CreateProjectModal({ teamId, onClose }: CreateProjectModalProps) {
  const zero = useZero();
  const { data: session } = useSession();
  const [teamMembers] = useQuery(queries.teamMembers(session, teamId));
  
  const [formData, setFormData] = useState({
    name: "",
    identifier: "",
    description: "",
    leadId: "",
    startDate: "",
    targetDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }
    
    if (!formData.identifier.trim()) {
      setError("Project identifier is required");
      return;
    }

    // Validate identifier (should be uppercase letters and numbers only)
    if (!/^[A-Z0-9]+$/.test(formData.identifier)) {
      setError("Identifier should only contain uppercase letters and numbers");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const projectId: string = `project_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      await zero.mutate.createProject({
        id: projectId,
        name: formData.name.trim(),
        identifier: formData.identifier.trim(),
        description: formData.description.trim() || undefined,
        teamId: teamId,
        leadId: formData.leadId || undefined,
        startDate: formData.startDate ? new Date(formData.startDate).getTime() : undefined,
        targetDate: formData.targetDate ? new Date(formData.targetDate).getTime() : undefined,
      });

      onClose();
    } catch (err) {
      console.error("Failed to create project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Mobile App Redesign"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Project Identifier *
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.identifier}
              onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value.toUpperCase() }))}
              placeholder="MAR"
              pattern="[A-Z0-9]+"
              title="Only uppercase letters and numbers allowed"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              Used in project organization. Only uppercase letters and numbers.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              className="input w-full"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the project goals and scope"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Project Lead
            </label>
            <select
              className="input w-full"
              value={formData.leadId}
              onChange={(e) => setFormData(prev => ({ ...prev, leadId: e.target.value }))}
            >
              <option value="">No Lead Assigned</option>
              {teamMembers?.map(member => (
                <option key={member.userId} value={member.userId}>
                  {member.user?.name || member.user?.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="input w-full"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Target Date
              </label>
              <input
                type="date"
                className="input w-full"
                value={formData.targetDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
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
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}