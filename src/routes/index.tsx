// src/routes/index.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@rocicorp/zero/react";
import { useSession } from "@/client/auth.js";
import { queries } from "@/shared/queries.js";
import { useZero } from "@/ui/use-zero.js";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: session } = useSession();
  const [userTeams] = useQuery(queries.userTeams(session));
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  
  // Update selected team when teams change
  useEffect(() => {
    if (userTeams && userTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(userTeams[0].id);
    }
  }, [userTeams, selectedTeamId]);
  const [showCreateTeam, setShowCreateTeam] = useState<boolean>(false);
  const navigate = useNavigate();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Linear Clone</h1>
          <p className="text-body mb-6">Please sign in to access your issues and projects.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate({ to: "/login" })}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!userTeams || userTeams.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Teams Found</h1>
          <p className="text-body mb-6">You need to be part of a team to start using Linear Clone.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateTeam(true)}
          >
            Create Team
          </button>
          {showCreateTeam && (
            <CreateTeamModal 
              onClose={() => setShowCreateTeam(false)} 
              onSuccess={(teamId: string) => {
                setShowCreateTeam(false);
                setSelectedTeamId(teamId);
                // Teams will automatically refresh due to Zero reactivity
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar 
        teams={userTeams} 
        selectedTeamId={selectedTeamId}
        onTeamSelect={setSelectedTeamId}
      />
      <MainContent teamId={selectedTeamId} />
    </div>
  );
}

interface SidebarProps {
  teams: any[];
  selectedTeamId: string;
  onTeamSelect: (teamId: string) => void;
}

function Sidebar({ teams, selectedTeamId, onTeamSelect }: SidebarProps) {
  const { data: session } = useSession();
  const [teamIssues] = useQuery(queries.teamIssues(session, selectedTeamId, null, null, null));
  const [userAssignedIssues] = useQuery(queries.userAssignedIssues(session, selectedTeamId));
  
  const openIssues = teamIssues?.filter(issue => 
    issue.status?.type === "backlog" || 
    issue.status?.type === "unstarted" || 
    issue.status?.type === "started"
  ) || [];
  
  const myOpenIssues = userAssignedIssues?.filter(issue =>
    issue.status?.type === "backlog" || 
    issue.status?.type === "unstarted" || 
    issue.status?.type === "started"
  ) || [];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
      {/* Team Selector */}
      <div className="p-4 border-b border-neutral-200">
        <select 
          className="input w-full"
          value={selectedTeamId}
          onChange={(e) => onTeamSelect(e.target.value)}
        >
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
            Your Work
          </div>
          
          <button className="nav-btn w-full text-left flex items-center justify-between">
            <span>My Issues</span>
            <span className="text-xs text-neutral-500">{myOpenIssues.length}</span>
          </button>
          
          <button className="nav-btn w-full text-left">
            Created by me
          </button>
          
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2 mt-6">
            Team
          </div>
          
          <button className="nav-btn w-full text-left flex items-center justify-between">
            <span>All Issues</span>
            <span className="text-xs text-neutral-500">{openIssues.length}</span>
          </button>
          
          <button className="nav-btn w-full text-left">
            Backlog
          </button>
          
          <button className="nav-btn w-full text-left">
            Active
          </button>
          
          <button className="nav-btn w-full text-left">
            Projects
          </button>
          
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2 mt-6">
            Views
          </div>
          
          <button className="nav-btn w-full text-left">
            Board
          </button>
          
          <button className="nav-btn w-full text-left">
            Timeline
          </button>
        </div>
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center space-x-3">
          {session?.user.image && (
            <img 
              src={session.user.image} 
              alt={session.user.name || "User"} 
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-neutral-900 truncate">
              {session?.user.name}
            </div>
            <div className="text-xs text-neutral-500 truncate">
              {session?.user.email}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface MainContentProps {
  teamId: string;
}

function MainContent({ teamId }: MainContentProps) {
  const { data: session } = useSession();
  const [teamIssues] = useQuery(queries.teamIssues(session, teamId, null, null, null));
  const [teamStatuses] = useQuery(queries.teamIssueStatuses(session, teamId));
  const [teamPriorities] = useQuery(queries.teamIssuePriorities(session, teamId));
  const [selectedView, setSelectedView] = useState<"list" | "board">("list");
  const [showCreateIssue, setShowCreateIssue] = useState<boolean>(false);

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-neutral-900">
              All Issues
            </h1>
            <div className="flex items-center space-x-2">
              <button 
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedView === "list" 
                    ? "bg-neutral-100 text-neutral-900" 
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                onClick={() => setSelectedView("list")}
              >
                List
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedView === "board" 
                    ? "bg-neutral-100 text-neutral-900" 
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                onClick={() => setSelectedView("board")}
              >
                Board
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="btn btn-default">
              Filter
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateIssue(true)}
            >
              New Issue
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {selectedView === "list" ? (
          <IssuesList 
            issues={teamIssues || []} 
            onCreateIssue={() => setShowCreateIssue(true)}
          />
        ) : (
          <IssuesBoard 
            issues={teamIssues || []} 
            statuses={teamStatuses || []}
          />
        )}
      </div>
      
      {showCreateIssue && (
        <CreateIssueModal 
          teamId={teamId}
          statuses={teamStatuses || []}
          priorities={teamPriorities || []}
          onClose={() => setShowCreateIssue(false)} 
          onSuccess={() => setShowCreateIssue(false)}
        />
      )}
    </main>
  );
}

interface IssuesListProps {
  issues: any[];
  onCreateIssue?: () => void;
}

function IssuesList({ issues, onCreateIssue }: IssuesListProps) {
  if (issues.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-neutral-500 mb-4">No issues found</div>
        <button 
          className="btn btn-primary"
          onClick={onCreateIssue}
        >
          Create your first issue
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-1">
        {issues.map((issue) => (
          <div 
            key={issue.id}
            className="flex items-center px-4 py-3 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  issue.priority?.value >= 3 ? "bg-red-500" :
                  issue.priority?.value >= 2 ? "bg-orange-500" :
                  issue.priority?.value >= 1 ? "bg-yellow-500" :
                  "bg-gray-400"
                }`} />
                <span className="text-sm text-neutral-500">
                  {issue.team?.identifier}-{issue.number}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="font-medium text-neutral-900">
                  {issue.title}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`px-2 py-1 text-xs rounded-full ${
                  issue.status?.type === "completed" ? "bg-green-100 text-green-800" :
                  issue.status?.type === "started" ? "bg-blue-100 text-blue-800" :
                  issue.status?.type === "unstarted" ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {issue.status?.name}
                </div>
                
                {issue.assignee && (
                  <div className="flex items-center space-x-2">
                    {issue.assignee.image && (
                      <img 
                        src={issue.assignee.image} 
                        alt={issue.assignee.name} 
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-sm text-neutral-600">
                      {issue.assignee.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface IssuesBoardProps {
  issues: any[];
  statuses: any[];
}

function IssuesBoard({ issues, statuses }: IssuesBoardProps) {
  const groupedIssues = statuses.reduce((acc, status) => {
    acc[status.id] = issues.filter(issue => issue.statusId === status.id);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="flex gap-6 p-6 overflow-x-auto min-h-full">
      {statuses.map((status) => (
        <div key={status.id} className="flex-shrink-0 w-80">
          <div className="mb-4">
            <h3 className="font-medium text-neutral-900 mb-1">
              {status.name}
            </h3>
            <div className="text-sm text-neutral-500">
              {groupedIssues[status.id]?.length || 0} issues
            </div>
          </div>
          
          <div className="space-y-3">
            {(groupedIssues[status.id] || []).map((issue) => (
              <div 
                key={issue.id}
                className="bg-white p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 cursor-pointer transition-colors"
              >
                <div className="mb-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${
                      issue.priority?.value >= 3 ? "bg-red-500" :
                      issue.priority?.value >= 2 ? "bg-orange-500" :
                      issue.priority?.value >= 1 ? "bg-yellow-500" :
                      "bg-gray-400"
                    }`} />
                    <span className="text-xs text-neutral-500">
                      {issue.team?.identifier}-{issue.number}
                    </span>
                  </div>
                  
                  <div className="font-medium text-neutral-900 text-sm">
                    {issue.title}
                  </div>
                </div>
                
                {issue.assignee && (
                  <div className="flex items-center space-x-2">
                    {issue.assignee.image && (
                      <img 
                        src={issue.assignee.image} 
                        alt={issue.assignee.name} 
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span className="text-xs text-neutral-600">
                      {issue.assignee.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface CreateTeamModalProps {
  onClose: () => void;
  onSuccess: (teamId: string) => void;
}

function CreateTeamModal({ onClose, onSuccess }: CreateTeamModalProps) {
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
      
      await zero.mutate.createTeam({
        id: teamId,
        name: formData.name.trim(),
        identifier: formData.identifier.trim().toUpperCase(),
        description: formData.description.trim() || undefined,
      });

      // Create default statuses for the new team
      const statusesData = [
        { name: "Backlog", type: "backlog" as const, position: 0 },
        { name: "Todo", type: "unstarted" as const, position: 1 },
        { name: "In Progress", type: "started" as const, position: 2 },
        { name: "Done", type: "completed" as const, position: 3 },
      ];

      for (const status of statusesData) {
        const statusId: string = `status_${teamId}_${status.type}`;
        await zero.mutate.createIssueStatus({
          id: statusId,
          name: status.name,
          type: status.type,
          position: status.position,
          teamId,
        });
      }

      // Create default priorities
      const prioritiesData = [
        { name: "No Priority", value: 0 },
        { name: "Low", value: 1 },
        { name: "Medium", value: 2 },
        { name: "High", value: 3 },
        { name: "Urgent", value: 4 },
      ];

      for (const priority of prioritiesData) {
        const priorityId: string = `priority_${teamId}_${priority.value}`;
        await zero.mutate.createIssuePriority({
          id: priorityId,
          name: priority.name,
          value: priority.value,
          teamId,
        });
      }

      onSuccess(teamId);
    } catch (err) {
      console.error("Failed to create team:", err);
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Team</h2>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
              placeholder="My Awesome Team"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Identifier *
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.identifier}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                identifier: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
              }))}
              placeholder="MAT"
              maxLength={10}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Used for issue numbering (e.g., MAT-123). Uppercase letters and numbers only.
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
              placeholder="Optional description of your team..."
              maxLength={200}
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

interface CreateIssueModalProps {
  teamId: string;
  statuses: any[];
  priorities: any[];
  onClose: () => void;
  onSuccess: () => void;
}

function CreateIssueModal({ teamId, statuses, priorities, onClose, onSuccess }: CreateIssueModalProps) {
  const zero = useZero();
  const { data: session } = useSession();
  const [teamMembers] = useQuery(queries.teamMembers(session, teamId));
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    statusId: statuses.find(s => s.type === "backlog")?.id || statuses[0]?.id || "",
    priorityId: priorities.find(p => p.value === 0)?.id || "",
    assigneeId: "",
    estimate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError("Issue title is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const issueId: string = `issue_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      await zero.mutate.createIssue({
        id: issueId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        statusId: formData.statusId,
        priorityId: formData.priorityId || undefined,
        projectId: undefined,
        teamId,
        assigneeId: formData.assigneeId || undefined,
        estimate: formData.estimate ? parseInt(formData.estimate) : undefined,
      });

      onSuccess();
    } catch (err) {
      console.error("Failed to create issue:", err);
      setError(err instanceof Error ? err.message : "Failed to create issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Issue</h2>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
              placeholder="What needs to be done?"
              maxLength={200}
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
              placeholder="Add more details..."
              maxLength={1000}
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
                {statuses.map(status => (
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
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              {isSubmitting ? "Creating..." : "Create Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
