import { useSession } from "@/client/auth.js";
import { queries } from "@/shared/queries.js";
import { useQuery } from "@/ui/use-zero.js";
import { useState } from "react";
import { CreateTeamModal } from "./create-team-modal.js";

interface SidebarProps {
  teams: any[];
  selectedTeamId: string;
  onTeamSelect: (teamId: string) => void;
  currentView: "all" | "myIssues" | "createdByMe" | "backlog" | "active" | "projects";
  onViewChange: (view: "all" | "myIssues" | "createdByMe" | "backlog" | "active" | "projects") => void;
  onCloseIssueDetail: () => void;
}

export function Sidebar({ teams, selectedTeamId, onTeamSelect, currentView, onViewChange, onCloseIssueDetail }: SidebarProps) {
  const { data: session } = useSession();
  const [teamIssues] = useQuery(queries.teamIssues(session, selectedTeamId, null, null, null));
  const [userAssignedIssues] = useQuery(queries.userAssignedIssues(session, selectedTeamId));
  const [showCreateTeam, setShowCreateTeam] = useState<boolean>(false);
  
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

  const handleViewChange = (view: "all" | "myIssues" | "createdByMe" | "backlog" | "active" | "projects"): void => {
    onCloseIssueDetail(); // Close any open issue detail first
    onViewChange(view); // Then change the view
  };

  const handleTeamCreated = (teamId: string): void => {
    setShowCreateTeam(false);
    onTeamSelect(teamId);
  };

  return (
    <>
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
            
            <button 
              className={`nav-btn w-full text-left flex items-center justify-between ${
                currentView === "myIssues" ? "bg-neutral-100" : ""
              }`}
              onClick={() => handleViewChange("myIssues")}
            >
              <span>My Issues</span>
              <span className="text-xs text-neutral-500">{myOpenIssues.length}</span>
            </button>
            
            <button 
              className={`nav-btn w-full text-left ${
                currentView === "createdByMe" ? "bg-neutral-100" : ""
              }`}
              onClick={() => handleViewChange("createdByMe")}
            >
              Created by me
            </button>
            
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2 mt-6">
              Team
            </div>
            
            <button 
              className={`nav-btn w-full text-left flex items-center justify-between ${
                currentView === "all" ? "bg-neutral-100" : ""
              }`}
              onClick={() => handleViewChange("all")}
            >
              <span>All Issues</span>
              <span className="text-xs text-neutral-500">{openIssues.length}</span>
            </button>
            
            <button 
              className={`nav-btn w-full text-left ${
                currentView === "backlog" ? "bg-neutral-100" : ""
              }`}
              onClick={() => handleViewChange("backlog")}
            >
              Backlog
            </button>
            
            <button 
              className={`nav-btn w-full text-left ${
                currentView === "active" ? "bg-neutral-100" : ""
              }`}
              onClick={() => handleViewChange("active")}
            >
              Active
            </button>
            
            <button 
              className={`nav-btn w-full text-left ${
                currentView === "projects" ? "bg-neutral-100" : ""
              }`}
              onClick={() => handleViewChange("projects")}
            >
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
          
          <button 
            className="btn btn-primary w-full mt-3"
            onClick={() => setShowCreateTeam(true)}
          >
            Create Team
          </button>
        </div>
      </aside>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <CreateTeamModal 
          onClose={() => setShowCreateTeam(false)}
          onSuccess={handleTeamCreated}
        />
      )}
    </>
  );
}