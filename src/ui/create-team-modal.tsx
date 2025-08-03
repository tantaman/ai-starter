import { useState } from "react";
import { useZero } from "@/ui/use-zero.js";

interface CreateTeamModalProps {
  onClose: () => void;
  onSuccess: (teamId: string) => void;
}

export function CreateTeamModal({ onClose, onSuccess }: CreateTeamModalProps) {
  const zero = useZero();
  const [formData, setFormData] = useState({
    name: "",
    identifier: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Team name is required");
      return;
    }
    
    if (!formData.identifier.trim()) {
      setError("Team identifier is required");
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
      const teamId: string = `team_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      // Create the team
      await zero.mutate.createTeam({
        id: teamId,
        name: formData.name.trim(),
        identifier: formData.identifier.trim(),
        description: formData.description.trim() || undefined,
      });

      // Create default statuses for the team
      const defaultStatuses = [
        { name: "Backlog", type: "backlog" as const, position: 0 },
        { name: "Todo", type: "unstarted" as const, position: 1 },
        { name: "In Progress", type: "started" as const, position: 2 },
        { name: "In Review", type: "started" as const, position: 3 },
        { name: "Done", type: "completed" as const, position: 4 },
        { name: "Canceled", type: "canceled" as const, position: 5 },
      ];

      for (const status of defaultStatuses) {
        const statusId: string = `status_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        await zero.mutate.createIssueStatus({
          id: statusId,
          name: status.name,
          type: status.type,
          position: status.position,
          teamId: teamId,
        });
      }

      // Create default priorities for the team
      const defaultPriorities = [
        { name: "No Priority", value: 0 },
        { name: "Low", value: 1 },
        { name: "Medium", value: 2 },
        { name: "High", value: 3 },
        { name: "Urgent", value: 4 },
      ];

      for (const priority of defaultPriorities) {
        const priorityId: string = `priority_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        await zero.mutate.createIssuePriority({
          id: priorityId,
          name: priority.name,
          value: priority.value,
          teamId: teamId,
        });
      }

      onSuccess(teamId);
    } catch (err) {
      console.error("Failed to create team:", err);
      setError("Failed to create team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">Create New Team</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Engineering Team"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Team Identifier *
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.identifier}
              onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value.toUpperCase() }))}
              placeholder="ENG"
              pattern="[A-Z0-9]+"
              title="Only uppercase letters and numbers allowed"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              Used in issue IDs (e.g., ENG-123). Only uppercase letters and numbers.
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
              placeholder="Optional description of your team"
            />
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
              {isSubmitting ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}