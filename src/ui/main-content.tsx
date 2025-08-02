import { useState } from "react";
import { useSession } from "@/client/auth.js";
import { queries } from "@/shared/queries.js";
import { useQuery } from "@/ui/use-zero.js";
import { IssueDetail } from "./issue-detail.js";
import { CreateIssueModal } from "./create-issue-modal.js";

interface MainContentProps {
  teamId: string;
  currentView: "all" | "myIssues" | "createdByMe" | "backlog" | "active" | "projects";
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string | null) => void;
}

export function MainContent({ teamId, currentView, selectedIssueId, onSelectIssue }: MainContentProps) {
  const { data: session } = useSession();
  const [teamIssues] = useQuery(queries.teamIssues(session, teamId, null, null, null));
  const [userAssignedIssues] = useQuery(queries.userAssignedIssues(session, teamId));
  const [userCreatedIssues] = useQuery(queries.userCreatedIssues(session, teamId));
  const [teamStatuses] = useQuery(queries.teamIssueStatuses(session, teamId));
  const [teamPriorities] = useQuery(queries.teamIssuePriorities(session, teamId));
  const [teamProjects] = useQuery(queries.teamProjects(session, teamId));
  const [selectedIssue] = useQuery(selectedIssueId ? queries.issueById(session, selectedIssueId) : queries.issueById(null, ""));
  const [displayView, setDisplayView] = useState<"list" | "board">("list");
  const [showCreateIssue, setShowCreateIssue] = useState<boolean>(false);

  // Get issues based on current view
  const getIssuesForCurrentView = (): any[] => {
    switch (currentView) {
      case "myIssues":
        return userAssignedIssues?.filter(issue => 
          issue.status?.type === "backlog" || 
          issue.status?.type === "unstarted" || 
          issue.status?.type === "started"
        ) || [];
      case "createdByMe":
        return userCreatedIssues || [];
      case "backlog":
        return teamIssues?.filter(issue => issue.status?.type === "backlog") || [];
      case "active":
        return teamIssues?.filter(issue => 
          issue.status?.type === "unstarted" || 
          issue.status?.type === "started"
        ) || [];
      case "projects":
        return []; // We'll handle projects separately
      case "all":
      default:
        return teamIssues || [];
    }
  };

  const currentIssues: any[] = getIssuesForCurrentView();
  
  // Get view title
  const getViewTitle = (): string => {
    switch (currentView) {
      case "myIssues": return "My Issues";
      case "createdByMe": return "Created by me";
      case "backlog": return "Backlog";
      case "active": return "Active Issues";
      case "projects": return "Projects";
      case "all":
      default: return "All Issues";
    }
  };

  // If an issue is selected, show the detail view
  if (selectedIssueId && selectedIssue) {
    return (
      <div className="flex-1 flex flex-col">
        <IssueDetail 
          issue={selectedIssue}
          onClose={() => onSelectIssue(null)}
        />
      </div>
    );
  }

  // Show projects view
  if (currentView === "projects") {
    return (
      <main className="flex-1 flex flex-col">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">Projects</h1>
          </div>
        </div>
        
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamProjects?.map(project => (
              <div key={project.id} className="card">
                <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                <p className="text-sm text-neutral-600 mb-3">{project.description}</p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Lead: {project.lead?.name || "Unassigned"}</span>
                  <span>{project.identifier}</span>
                </div>
              </div>
            ))}
            
            {(!teamProjects || teamProjects.length === 0) && (
              <div className="col-span-full text-center py-12">
                <p className="text-neutral-500">No projects yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Show issues view (list or board)
  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">{getViewTitle()}</h1>
          <div className="flex items-center space-x-3">
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button
                className={`px-3 py-1 text-sm rounded ${
                  displayView === "list"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                onClick={() => setDisplayView("list")}
              >
                List
              </button>
              <button
                className={`px-3 py-1 text-sm rounded ${
                  displayView === "board"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                onClick={() => setDisplayView("board")}
              >
                Board
              </button>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateIssue(true)}
            >
              Create Issue
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {displayView === "list" ? (
          // List View
          <div className="h-full overflow-auto">
            <div className="p-6">
              {currentIssues.length > 0 ? (
                <div className="space-y-2">
                  {currentIssues.map(issue => (
                    <div
                      key={issue.id}
                      className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 cursor-pointer transition-colors"
                      onClick={() => onSelectIssue(issue.id)}
                    >
                      {/* Priority indicator */}
                      <div className={`w-3 h-3 rounded-full ${
                        issue.priority?.value >= 3 ? "bg-red-500" :
                        issue.priority?.value >= 2 ? "bg-orange-500" :
                        issue.priority?.value >= 1 ? "bg-yellow-500" :
                        "bg-gray-400"
                      }`} />
                      
                      {/* Issue identifier */}
                      <div className="text-sm text-neutral-500 font-mono min-w-0">
                        {issue.team?.identifier}-{issue.number}
                      </div>
                      
                      {/* Title */}
                      <div className="flex-1 font-medium text-neutral-900 truncate">
                        {issue.title}
                      </div>
                      
                      {/* Status */}
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        issue.status?.type === "completed" ? "bg-green-100 text-green-800" :
                        issue.status?.type === "started" ? "bg-blue-100 text-blue-800" :
                        issue.status?.type === "unstarted" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {issue.status?.name}
                      </div>
                      
                      {/* Assignee */}
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-500">No issues found.</p>
                  <button 
                    className="btn btn-primary mt-4"
                    onClick={() => setShowCreateIssue(true)}
                  >
                    Create your first issue
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Board View
          <div className="h-full p-6">
            <div className="h-full overflow-x-auto">
              <div className="flex gap-4 h-full" style={{ minWidth: `${(teamStatuses?.length || 0) * 280 + (teamStatuses?.length || 0) * 16}px` }}>
                {teamStatuses?.map(status => (
                  <div key={status.id} className="flex-shrink-0" style={{ width: '280px' }}>
                    <div className="bg-neutral-50 rounded-lg p-4 h-full flex flex-col">
                      <h3 className="font-medium text-neutral-900 mb-4 flex items-center justify-between">
                        {status.name}
                        <span className="text-xs text-neutral-500">
                          {currentIssues.filter(issue => issue.statusId === status.id).length}
                        </span>
                      </h3>
                      <div className="flex-1 overflow-y-auto space-y-3">
                        {currentIssues
                          .filter(issue => issue.statusId === status.id)
                          .map(issue => (
                            <div
                              key={issue.id}
                              className="bg-white p-3 rounded-lg border border-neutral-200 cursor-pointer hover:border-neutral-300 transition-colors"
                              onClick={() => onSelectIssue(issue.id)}
                            >
                              <div className="flex items-center space-x-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  issue.priority?.value >= 3 ? "bg-red-500" :
                                  issue.priority?.value >= 2 ? "bg-orange-500" :
                                  issue.priority?.value >= 1 ? "bg-yellow-500" :
                                  "bg-gray-400"
                                }`} />
                                <span className="text-xs text-neutral-500 font-mono">
                                  {issue.team?.identifier}-{issue.number}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-neutral-900 mb-2">
                                {issue.title}
                              </p>
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Issue Modal */}
      {showCreateIssue && (
        <CreateIssueModal 
          teamId={teamId}
          onClose={() => setShowCreateIssue(false)}
        />
      )}
    </main>
  );
}