import { useState } from "react";
import { useSession } from "@/client/auth.js";
import { queries } from "@/shared/queries.js";
import { useQuery, useZero } from "@/ui/use-zero.js";
import { IssueDetail } from "./issue-detail.js";
import { CreateIssueModal } from "./create-issue-modal.js";
import { CreateProjectModal } from "./create-project-modal.js";
import { GanttChart } from "./gantt-chart.js";

interface MainContentProps {
  teamId: string;
  teams: any[];
  currentView: "all" | "myIssues" | "createdByMe" | "backlog" | "active" | "projects" | "team";
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string | null) => void;
}

export function MainContent({ teamId, teams, currentView, selectedIssueId, onSelectIssue }: MainContentProps) {
  const { data: session } = useSession();
  const zero = useZero();
  const [teamIssues] = useQuery(queries.teamIssues(session, teamId, null, null, null));
  const [userAssignedIssues] = useQuery(queries.userAssignedIssues(session, teamId));
  const [userCreatedIssues] = useQuery(queries.userCreatedIssues(session, teamId));
  const [teamStatuses] = useQuery(queries.teamIssueStatuses(session, teamId));
  const [teamPriorities] = useQuery(queries.teamIssuePriorities(session, teamId));
  const [teamProjects] = useQuery(queries.teamProjects(session, teamId));
  const [teamMembers] = useQuery(queries.teamMembers(session, teamId));
  const [selectedIssue] = useQuery(selectedIssueId ? queries.issueById(session, selectedIssueId) : queries.issueById(null, ""));
  const [displayView, setDisplayView] = useState<"list" | "board" | "gantt">("list");
  const [showCreateIssue, setShowCreateIssue] = useState<boolean>(false);
  const [draggedIssue, setDraggedIssue] = useState<any>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterAssignee, setFilterAssignee] = useState<string>("");
  const [filterProject, setFilterProject] = useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [showCreateProject, setShowCreateProject] = useState<boolean>(false);

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
      case "team":
        return []; // We'll handle team management separately
      case "all":
      default:
        return teamIssues || [];
    }
  };

  const baseIssues: any[] = getIssuesForCurrentView();

  // Apply search and filters
  const filteredIssues: any[] = baseIssues.filter(issue => {
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        issue.title?.toLowerCase().includes(searchLower) ||
        issue.description?.toLowerCase().includes(searchLower) ||
        `${issue.team?.identifier}-${issue.number}`.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filterStatus && issue.statusId !== filterStatus) return false;

    // Priority filter
    if (filterPriority && issue.priorityId !== filterPriority) return false;

    // Assignee filter
    if (filterAssignee) {
      if (filterAssignee === "unassigned" && issue.assigneeId) return false;
      if (filterAssignee !== "unassigned" && issue.assigneeId !== filterAssignee) return false;
    }

    // Project filter
    if (filterProject) {
      if (filterProject === "no-project" && issue.projectId) return false;
      if (filterProject !== "no-project" && issue.projectId !== filterProject) return false;
    }

    return true;
  });

  const currentIssues: any[] = filteredIssues;
  
  // Get view title
  const getViewTitle = (): string => {
    switch (currentView) {
      case "myIssues": return "My Issues";
      case "createdByMe": return "Created by me";
      case "backlog": return "Backlog";
      case "active": return "Active Issues";
      case "projects": return "Projects";
      case "team": return "Team Settings";
      case "all":
      default: return "All Issues";
    }
  };

  // Filter management
  const clearAllFilters = (): void => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterPriority("");
    setFilterAssignee("");
    setFilterProject("");
  };

  const hasActiveFilters = !!(searchTerm || filterStatus || filterPriority || filterAssignee || filterProject);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, issue: any): void => {
    setDraggedIssue(issue);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragEnd = (): void => {
    setDraggedIssue(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (statusId: string): void => {
    setDragOverColumn(statusId);
  };

  const handleDragLeave = (): void => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatusId: string): Promise<void> => {
    e.preventDefault();
    
    if (!draggedIssue || draggedIssue.statusId === targetStatusId) {
      setDraggedIssue(null);
      setDragOverColumn(null);
      return;
    }

    try {
      await zero.mutate.updateIssue({
        id: draggedIssue.id,
        statusId: targetStatusId,
      });
    } catch (err) {
      console.error("Failed to update issue status:", err);
    } finally {
      setDraggedIssue(null);
      setDragOverColumn(null);
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
        {/* Projects Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">Projects</h1>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateProject(true)}
            >
              Create Project
            </button>
          </div>
        </div>
        
        {/* Projects Content */}
        <div className="flex-1 p-6">
          {teamProjects && teamProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamProjects.map(project => {
                const projectIssues = teamIssues?.filter(issue => issue.projectId === project.id) || [];
                const completedIssues = projectIssues.filter(issue => issue.status?.type === "completed");
                const progressPercentage = projectIssues.length > 0 ? (completedIssues.length / projectIssues.length) * 100 : 0;
                
                return (
                  <div key={project.id} className="card hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
                        <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                          {project.identifier}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-neutral-900">
                          {completedIssues.length}/{projectIssues.length}
                        </div>
                        <div className="text-xs text-neutral-500">issues</div>
                      </div>
                    </div>
                    
                    {project.description && (
                      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{project.description}</p>
                    )}
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-neutral-500 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Lead */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">Lead:</span>
                        <div className="flex items-center space-x-2">
                          {project.lead?.image && (
                            <img 
                              src={project.lead.image} 
                              alt={project.lead.name} 
                              className="w-5 h-5 rounded-full"
                            />
                          )}
                          <span className="text-neutral-900">
                            {project.lead?.name || "Unassigned"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Dates */}
                      {(project.startDate || project.targetDate) && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500">Timeline:</span>
                          <span className="text-neutral-900">
                            {project.startDate && new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {project.startDate && project.targetDate && ' - '}
                            {project.targetDate && new Date(project.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                      
                      {/* Status indicators */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex space-x-3">
                          <span className="text-green-600">
                            {projectIssues.filter(issue => issue.status?.type === "completed").length} done
                          </span>
                          <span className="text-blue-600">
                            {projectIssues.filter(issue => issue.status?.type === "started").length} in progress
                          </span>
                          <span className="text-neutral-500">
                            {projectIssues.filter(issue => issue.status?.type === "backlog" || issue.status?.type === "unstarted").length} pending
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No projects yet</h3>
                <p className="text-neutral-500 mb-4">
                  Projects help you organize and track related issues together.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateProject(true)}
                >
                  Create your first project
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create Project Modal */}
        {showCreateProject && (
          <CreateProjectModal 
            teamId={teamId}
            onClose={() => setShowCreateProject(false)}
          />
        )}
      </main>
    );
  }

  // Show team settings view
  if (currentView === "team") {
    return (
      <main className="flex-1 flex flex-col">
        {/* Team Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">Team Settings</h1>
          </div>
        </div>
        
        {/* Team Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Team Members Section */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Team Members</h2>
              <div className="bg-white rounded-lg border border-neutral-200">
                <div className="p-4 border-b border-neutral-200">
                  <div className="grid grid-cols-3 gap-4 text-sm font-medium text-neutral-500">
                    <span>Member</span>
                    <span>Role</span>
                    <span>Joined</span>
                  </div>
                </div>
                <div className="divide-y divide-neutral-200">
                  {teamMembers?.map(member => (
                    <div key={member.id} className="p-4">
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="flex items-center space-x-3">
                          {member.user?.image && (
                            <img 
                              src={member.user.image} 
                              alt={member.user.name} 
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div>
                            <div className="font-medium text-neutral-900">
                              {member.user?.name || "Unknown User"}
                            </div>
                            <div className="text-sm text-neutral-500">
                              {member.user?.email}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            member.role === "admin" 
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {member.role}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-500">
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Information */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Team Information</h2>
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Team Name
                    </label>
                    <div className="text-neutral-900">
                      {teams.find(t => t.id === teamId)?.name || "Unknown Team"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Team Identifier
                    </label>
                    <div className="text-neutral-900 font-mono">
                      {teams.find(t => t.id === teamId)?.identifier || "N/A"}
                    </div>
                  </div>
                  {teams.find(t => t.id === teamId)?.description && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Description
                      </label>
                      <div className="text-neutral-900">
                        {teams.find(t => t.id === teamId)?.description}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Created
                    </label>
                    <div className="text-neutral-900">
                      {teams.find(t => t.id === teamId)?.createdAt && 
                        new Date(teams.find(t => t.id === teamId)?.createdAt).toLocaleDateString()
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Statistics */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Team Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-neutral-200 p-6">
                  <div className="text-2xl font-bold text-neutral-900">
                    {teamIssues?.length || 0}
                  </div>
                  <div className="text-sm text-neutral-500">Total Issues</div>
                </div>
                <div className="bg-white rounded-lg border border-neutral-200 p-6">
                  <div className="text-2xl font-bold text-neutral-900">
                    {teamProjects?.length || 0}
                  </div>
                  <div className="text-sm text-neutral-500">Projects</div>
                </div>
                <div className="bg-white rounded-lg border border-neutral-200 p-6">
                  <div className="text-2xl font-bold text-neutral-900">
                    {teamMembers?.length || 0}
                  </div>
                  <div className="text-sm text-neutral-500">Team Members</div>
                </div>
              </div>
            </div>
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
        <div className="flex items-center justify-between mb-4">
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
              <button
                className={`px-3 py-1 text-sm rounded ${
                  displayView === "gantt"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                onClick={() => setDisplayView("gantt")}
              >
                Gantt
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

        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search issues..."
                className="input w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Toggle */}
            <button
              className={`btn ${showAdvancedFilters ? 'btn-primary' : 'btn-default'}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              Filters {hasActiveFilters && `(${[searchTerm, filterStatus, filterPriority, filterAssignee, filterProject].filter(Boolean).length})`}
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                className="btn btn-default text-sm"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-neutral-50 rounded-lg">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Status</label>
                <select
                  className="input w-full text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {teamStatuses?.map(status => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Priority</label>
                <select
                  className="input w-full text-sm"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  {teamPriorities?.map(priority => (
                    <option key={priority.id} value={priority.id}>{priority.name}</option>
                  ))}
                </select>
              </div>

              {/* Assignee Filter */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Assignee</label>
                <select
                  className="input w-full text-sm"
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                >
                  <option value="">All Assignees</option>
                  <option value="unassigned">Unassigned</option>
                  {teamMembers?.map(member => (
                    <option key={member.userId} value={member.userId}>
                      {member.user?.name || member.user?.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Filter */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Project</label>
                <select
                  className="input w-full text-sm"
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                >
                  <option value="">All Projects</option>
                  <option value="no-project">No Project</option>
                  {teamProjects?.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
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
        ) : displayView === "board" ? (
          // Board View
          <div className="h-full p-6">
            <div className="h-full overflow-x-auto">
              <div className="flex gap-4 h-full" style={{ minWidth: `${(teamStatuses?.length || 0) * 280 + (teamStatuses?.length || 0) * 16}px` }}>
                {teamStatuses?.map(status => (
                  <div 
                    key={status.id} 
                    className="flex-shrink-0" 
                    style={{ width: '280px' }}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter(status.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, status.id)}
                  >
                    <div className={`rounded-lg p-4 h-full flex flex-col transition-colors ${
                      dragOverColumn === status.id 
                        ? "bg-blue-50 border-2 border-blue-300 border-dashed" 
                        : "bg-neutral-50"
                    }`}>
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
                              draggable
                              className={`bg-white p-3 rounded-lg border cursor-move hover:border-neutral-300 transition-all select-none ${
                                draggedIssue?.id === issue.id 
                                  ? "opacity-50 border-blue-300" 
                                  : "border-neutral-200"
                              }`}
                              onDragStart={(e) => handleDragStart(e, issue)}
                              onDragEnd={handleDragEnd}
                              onClick={(e) => {
                                // Only open detail if not dragging
                                if (!draggedIssue) {
                                  onSelectIssue(issue.id);
                                }
                              }}
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
        ) : (
          // Gantt View
          <GanttChart
            issues={currentIssues}
            projects={teamProjects || []}
            onSelectIssue={onSelectIssue}
          />
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