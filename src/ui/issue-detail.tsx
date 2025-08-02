import { useState } from "react";
import { useSession } from "@/client/auth.js";
import { queries } from "@/shared/queries.js";
import { useQuery, useZero } from "@/ui/use-zero.js";
import { EditIssueModal } from "./edit-issue-modal.js";

interface IssueDetailProps {
  issue: any;
  onClose: () => void;
}

export function IssueDetail({ issue, onClose }: IssueDetailProps) {
  const zero = useZero();
  const { data: session } = useSession();
  const [teamMembers] = useQuery(queries.teamMembers(session, issue.teamId));
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>("");
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(issue.title || "");
  const [editDescription, setEditDescription] = useState<string>(issue.description || "");

  // Check if user can edit this issue
  const canEdit: boolean = session ? (
    session.user.id === issue.creatorId || 
    session.user.id === issue.assigneeId ||
    teamMembers?.some(member => 
      member.userId === session.user.id && member.role === "admin"
    )
  ) : false;

  const handleAddComment = async (): Promise<void> => {
    if (!commentText.trim()) return;
    
    try {
      const commentId: string = `comment_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      await zero.mutate.createIssueComment({
        id: commentId,
        issueId: issue.id,
        body: commentText.trim(),
      });
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleDeleteIssue = async (): Promise<void> => {
    if (!confirm(`Are you sure you want to delete issue ${issue.team?.identifier}-${issue.number}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await zero.mutate.deleteIssue({
        id: issue.id,
      });
      onClose(); // Close the detail view after deletion
    } catch (err) {
      console.error("Failed to delete issue:", err);
      alert("Failed to delete issue. Please try again.");
    }
  };

  const handleSaveTitle = async (): Promise<void> => {
    if (!editTitle.trim()) return;
    
    try {
      await zero.mutate.updateIssue({
        id: issue.id,
        title: editTitle.trim(),
      });
      setIsEditingTitle(false);
    } catch (err) {
      console.error("Failed to update title:", err);
      setEditTitle(issue.title || ""); // Reset on error
    }
  };

  const handleSaveDescription = async (): Promise<void> => {
    try {
      await zero.mutate.updateIssue({
        id: issue.id,
        description: editDescription.trim() || undefined,
      });
      setIsEditingDescription(false);
    } catch (err) {
      console.error("Failed to update description:", err);
      setEditDescription(issue.description || ""); // Reset on error
    }
  };

  const handleCancelTitleEdit = (): void => {
    setEditTitle(issue.title || "");
    setIsEditingTitle(false);
  };

  const handleCancelDescriptionEdit = (): void => {
    setEditDescription(issue.description || "");
    setIsEditingDescription(false);
  };

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Issue header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  issue.priority?.value >= 3 ? "bg-red-500" :
                  issue.priority?.value >= 2 ? "bg-orange-500" :
                  issue.priority?.value >= 1 ? "bg-yellow-500" :
                  "bg-gray-400"
                }`} />
                <span className="text-sm text-neutral-500">
                  {issue.team?.identifier}-{issue.number}
                </span>
                <div className={`px-2 py-1 text-xs rounded-full ${
                  issue.status?.type === "completed" ? "bg-green-100 text-green-800" :
                  issue.status?.type === "started" ? "bg-blue-100 text-blue-800" :
                  issue.status?.type === "unstarted" ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {issue.status?.name}
                </div>
              </div>
              
              {/* Edit and Delete buttons - only show if user can edit */}
              {canEdit && (
                <div className="flex space-x-2">
                  <button 
                    className="btn btn-default"
                    onClick={() => setShowEditModal(true)}
                  >
                    Edit Issue
                  </button>
                  <button 
                    className="btn btn-default text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteIssue()}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            
            {/* Title - inline editing */}
            {isEditingTitle ? (
              <div className="mb-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl font-bold text-neutral-900 w-full border-none outline-none bg-transparent border-b-2 border-blue-500 focus:border-blue-600"
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveTitle();
                    } else if (e.key === 'Escape') {
                      handleCancelTitleEdit();
                    }
                  }}
                  autoFocus
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={handleSaveTitle}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelTitleEdit}
                    className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <h1 
                className={`text-2xl font-bold text-neutral-900 mb-4 ${canEdit ? 'cursor-pointer hover:bg-gray-50 rounded px-1' : ''}`}
                onClick={canEdit ? () => setIsEditingTitle(true) : undefined}
                title={canEdit ? "Click to edit title" : undefined}
              >
                {issue.title}
              </h1>
            )}
            
            {/* Description - inline editing */}
            {isEditingDescription ? (
              <div className="mb-6">
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="text-neutral-700 w-full min-h-[100px] border-2 border-blue-500 rounded p-2 focus:border-blue-600 outline-none resize-vertical"
                  onBlur={handleSaveDescription}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      handleCancelDescriptionEdit();
                    }
                    // Allow Ctrl+Enter or Cmd+Enter to save
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      handleSaveDescription();
                    }
                  }}
                  placeholder="Add a description..."
                  autoFocus
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={handleSaveDescription}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelDescriptionEdit}
                    className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className={`text-neutral-700 mb-6 whitespace-pre-wrap min-h-[40px] ${canEdit ? 'cursor-pointer hover:bg-gray-50 rounded p-1' : ''}`}
                onClick={canEdit ? () => setIsEditingDescription(true) : undefined}
                title={canEdit ? "Click to edit description" : undefined}
              >
                {issue.description || (canEdit ? <span className="text-gray-400 italic">Click to add description...</span> : null)}
              </div>
            )}
          </div>

          {/* Issue metadata */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-2">Assignee</h3>
              <div className="flex items-center space-x-2">
                {issue.assignee?.image && (
                  <img 
                    src={issue.assignee.image} 
                    alt={issue.assignee.name} 
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-sm">
                  {issue.assignee?.name || "Unassigned"}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-2">Priority</h3>
              <span className="text-sm">{issue.priority?.name || "No Priority"}</span>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-2">Created by</h3>
              <div className="flex items-center space-x-2">
                {issue.creator?.image && (
                  <img 
                    src={issue.creator.image} 
                    alt={issue.creator.name} 
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-sm">{issue.creator?.name}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-2">Project</h3>
              <span className="text-sm">{issue.project?.name || "No Project"}</span>
            </div>
          </div>

          {/* Comments section */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">Activity</h3>
            
            {/* Comments list */}
            <div className="space-y-4 mb-6">
              {issue.comments?.map((comment: any) => (
                <div key={comment.id} className="flex space-x-3">
                  {comment.author?.image && (
                    <img 
                      src={comment.author.image} 
                      alt={comment.author.name} 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">{comment.author?.name}</span>
                      <span className="text-xs text-neutral-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-700 whitespace-pre-wrap">
                      {comment.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment form */}
            {session && (
              <div className="flex space-x-3">
                {session.user.image && (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "You"} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <textarea
                    className="input w-full"
                    rows={3}
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddComment}
                      className="btn btn-primary"
                      disabled={!commentText.trim()}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close button */}
      <div className="p-4">
        <button
          onClick={onClose}
          className="btn btn-default"
        >
          ← Back to Issues
        </button>
      </div>

      {/* Edit Issue Modal */}
      {showEditModal && (
        <EditIssueModal 
          issue={issue}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}