import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/client/auth.js";
import { queries } from "@/shared/queries.js";
import { useQuery } from "@/ui/use-zero.js";
import { useState, useEffect } from "react";
import { Sidebar } from "@/ui/sidebar.js";
import { MainContent } from "@/ui/main-content.js";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (session === null) {
      navigate({ to: "/login" });
    }
  }, [session, navigate]);
  const [userTeams] = useQuery(queries.userTeams(session));
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [currentView, setCurrentView] = useState<"all" | "myIssues" | "createdByMe" | "backlog" | "active" | "projects" | "team">("all");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Set the first team as selected when teams load
  useEffect(() => {
    if (userTeams && userTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(userTeams[0].id);
    }
  }, [userTeams, selectedTeamId]);

  // Show loading if no teams are available yet
  if (!userTeams || userTeams.length === 0 || !selectedTeamId) {
    return (
      <div className="flex h-screen bg-neutral-50 items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-neutral-900 mb-2">
            {!userTeams ? "Loading..." : "No teams found"}
          </div>
          {userTeams && userTeams.length === 0 && (
            <p className="text-neutral-600">
              Create your first team to get started with issue tracking.
            </p>
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
        onTeamSelect={(teamId) => {
          setSelectedIssueId(null); // Close any open issue detail when changing teams
          setSelectedTeamId(teamId);
        }}
        currentView={currentView}
        onViewChange={setCurrentView}
        onCloseIssueDetail={() => setSelectedIssueId(null)}
      />
      <MainContent 
        teamId={selectedTeamId} 
        teams={userTeams}
        currentView={currentView}
        selectedIssueId={selectedIssueId}
        onSelectIssue={setSelectedIssueId}
      />
    </div>
  );
}