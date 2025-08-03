import { useState, useMemo } from "react";
import { useZero } from "@/ui/use-zero.js";

interface GanttChartProps {
  issues: any[];
  projects: any[];
  onSelectIssue: (issueId: string) => void;
}

interface GanttItem {
  id: string;
  title: string;
  type: "issue" | "project";
  startDate: number;
  endDate: number;
  status: string;
  priority?: any;
  project?: any;
  assignee?: any;
  progress?: number;
}

export function GanttChart({ issues, projects, onSelectIssue }: GanttChartProps) {
  const zero = useZero();
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const now: Date = new Date();
    const start: Date = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end: Date = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return { start, end };
  });
  const [draggedItem, setDraggedItem] = useState<GanttItem | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);

  // Convert issues and projects to gantt items
  const ganttItems: GanttItem[] = useMemo(() => {
    const items: GanttItem[] = [];
    
    // Add projects
    projects?.forEach(project => {
      if (project.startDate || project.targetDate) {
        const projectIssues = issues?.filter(issue => issue.projectId === project.id) || [];
        const completedIssues = projectIssues.filter(issue => issue.status?.type === "completed");
        const progress = projectIssues.length > 0 ? (completedIssues.length / projectIssues.length) * 100 : 0;
        
        items.push({
          id: project.id,
          title: project.name,
          type: "project",
          startDate: project.startDate || project.targetDate - (30 * 24 * 60 * 60 * 1000), // Default to 30 days before target
          endDate: project.targetDate || project.startDate + (30 * 24 * 60 * 60 * 1000), // Default to 30 days after start
          status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : "not-started",
          progress,
        });
      }
    });

    // Add issues with dates
    issues?.forEach(issue => {
      // Use explicit start/due dates if available, otherwise fall back to creation/completion dates
      let startDate: number = issue.startDate || issue.createdAt;
      let endDate: number = issue.dueDate || issue.completedAt || startDate + (7 * 24 * 60 * 60 * 1000); // Default 7 days duration
      
      // If issue has estimate and no due date, use that for duration
      if (issue.estimate && !issue.dueDate && !issue.completedAt) {
        endDate = startDate + (issue.estimate * 24 * 60 * 60 * 1000); // Estimate in days
      }
      
      items.push({
        id: issue.id,
        title: issue.title,
        type: "issue",
        startDate,
        endDate,
        status: issue.status?.type || "unstarted",
        priority: issue.priority,
        project: issue.project,
        assignee: issue.assignee,
      });
    });

    return items.sort((a, b) => {
      // Sort projects first, then by start date
      if (a.type !== b.type) {
        return a.type === "project" ? -1 : 1;
      }
      return a.startDate - b.startDate;
    });
  }, [issues, projects]);

  // Calculate time scale
  const timeScale = useMemo(() => {
    const totalDays: number = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000));
    const dayWidth: number = Math.max(20, Math.min(40, 800 / totalDays)); // Responsive day width
    
    const days: Date[] = [];
    for (let i = 0; i < totalDays; i++) {
      const day: Date = new Date(dateRange.start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    
    return { days, dayWidth, totalWidth: totalDays * dayWidth };
  }, [dateRange]);

  const getBarPosition = (item: GanttItem) => {
    const startOffset: number = Math.max(0, item.startDate - dateRange.start.getTime());
    const endOffset: number = Math.min(dateRange.end.getTime() - dateRange.start.getTime(), item.endDate - dateRange.start.getTime());
    
    const left: number = (startOffset / (24 * 60 * 60 * 1000)) * timeScale.dayWidth;
    const width: number = Math.max(timeScale.dayWidth * 0.5, ((endOffset - startOffset) / (24 * 60 * 60 * 1000)) * timeScale.dayWidth);
    
    return { left, width };
  };

  const getStatusColor = (item: GanttItem): string => {
    if (item.type === "project") {
      if (item.status === "completed") return "bg-green-500";
      if (item.status === "in-progress") return "bg-blue-500";
      return "bg-gray-400";
    }
    
    switch (item.status) {
      case "completed": return "bg-green-500";
      case "started": return "bg-blue-500";
      case "unstarted": return "bg-yellow-500";
      case "backlog": return "bg-gray-400";
      default: return "bg-gray-300";
    }
  };

  const getPriorityIndicator = (priority: any): string => {
    if (!priority) return "";
    if (priority.value >= 3) return "border-l-4 border-red-500";
    if (priority.value >= 2) return "border-l-4 border-orange-500";
    if (priority.value >= 1) return "border-l-4 border-yellow-500";
    return "border-l-4 border-gray-400";
  };

  const adjustDateRange = (direction: "prev" | "next"): void => {
    const days: number = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000));
    const offset: number = direction === "prev" ? -days : days;
    
    setDateRange(prev => ({
      start: new Date(prev.start.getTime() + offset * 24 * 60 * 60 * 1000),
      end: new Date(prev.end.getTime() + offset * 24 * 60 * 60 * 1000),
    }));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: GanttItem): void => {
    if (item.type === "project") return; // Don't allow dragging projects for now
    
    setDraggedItem(item);
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    setDragOffset(offsetX);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (): void => {
    setDraggedItem(null);
    setDragOffset(0);
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent): Promise<void> => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left - dragOffset;
    const dayIndex = Math.floor(relativeX / timeScale.dayWidth);
    
    if (dayIndex < 0 || dayIndex >= timeScale.days.length) return;
    
    const newStartDate = new Date(timeScale.days[dayIndex]);
    const duration = draggedItem.endDate - draggedItem.startDate;
    const newEndDate = new Date(newStartDate.getTime() + duration);
    
    try {
      await zero.mutate.updateIssue({
        id: draggedItem.id,
        startDate: newStartDate.getTime(),
        dueDate: newEndDate.getTime(),
      });
    } catch (err) {
      console.error("Failed to update issue dates:", err);
    } finally {
      setDraggedItem(null);
      setDragOffset(0);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Date Range Controls */}
      <div className="flex items-center justify-between mb-4 px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => adjustDateRange("prev")}
            className="btn btn-default"
          >
            ← Previous
          </button>
          <span className="text-sm font-medium text-neutral-700">
            {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
          </span>
          <button
            onClick={() => adjustDateRange("next")}
            className="btn btn-default"
          >
            Next →
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDateRange({
              start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              end: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0)
            })}
            className="btn btn-default text-sm"
          >
            Today
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Task List */}
          <div className="w-80 flex-shrink-0 border-r border-neutral-200">
            {/* Header */}
            <div className="h-12 bg-neutral-50 border-b border-neutral-200 flex items-center px-4">
              <span className="text-sm font-medium text-neutral-700">Tasks</span>
            </div>
            
            {/* Task Rows */}
            <div>
              {ganttItems.map(item => (
                <div
                  key={item.id}
                  className={`h-12 border-b border-neutral-100 flex items-center px-4 hover:bg-neutral-50 cursor-pointer ${
                    item.type === "project" ? "bg-neutral-25 font-medium" : ""
                  }`}
                  onClick={() => {
                    if (item.type === "issue") {
                      onSelectIssue(item.id);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3 w-full">
                    {item.type === "project" ? (
                      <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                        </svg>
                      </div>
                    ) : (
                      <div className={`w-3 h-3 rounded-full ${
                        item.priority?.value >= 3 ? "bg-red-500" :
                        item.priority?.value >= 2 ? "bg-orange-500" :
                        item.priority?.value >= 1 ? "bg-yellow-500" :
                        "bg-gray-400"
                      }`} />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-neutral-900 truncate">
                        {item.title}
                      </div>
                      {item.type === "issue" && item.assignee && (
                        <div className="text-xs text-neutral-500 truncate">
                          {item.assignee.name}
                        </div>
                      )}
                      {item.type === "project" && item.progress !== undefined && (
                        <div className="text-xs text-neutral-500">
                          {Math.round(item.progress)}% complete
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="flex-1" onDragOver={handleDragOver} onDrop={handleDrop}>
            {/* Timeline Header */}
            <div className="h-12 bg-neutral-50 border-b border-neutral-200 flex">
              {timeScale.days.map((day, index) => (
                <div
                  key={index}
                  className="border-r border-neutral-200 flex items-center justify-center text-xs text-neutral-600"
                  style={{ width: timeScale.dayWidth }}
                >
                  {index % 7 === 0 && (
                    <div className="text-center">
                      <div>{day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Timeline Bars */}
            <div className="relative">
              {ganttItems.map((item, index) => {
                const position = getBarPosition(item);
                const isDragging = draggedItem?.id === item.id;
                return (
                  <div key={item.id} className="relative h-12 border-b border-neutral-100">
                    {/* Grid lines */}
                    {timeScale.days.map((_, dayIndex) => (
                      <div
                        key={dayIndex}
                        className="absolute top-0 h-full border-r border-neutral-100"
                        style={{ left: dayIndex * timeScale.dayWidth, width: 1 }}
                      />
                    ))}
                    
                    {/* Task bar */}
                    <div
                      draggable={item.type === "issue"}
                      className={`absolute top-2 h-8 rounded ${getStatusColor(item)} ${getPriorityIndicator(item.priority)} ${
                        item.type === "issue" 
                          ? "cursor-move hover:opacity-80" 
                          : "cursor-pointer hover:opacity-80"
                      } transition-opacity flex items-center px-2 ${
                        isDragging ? "opacity-50 z-10" : ""
                      }`}
                      style={{
                        left: position.left,
                        width: position.width,
                      }}
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (item.type === "issue" && !isDragging) {
                          onSelectIssue(item.id);
                        }
                      }}
                    >
                      {/* Progress bar for projects */}
                      {item.type === "project" && item.progress !== undefined && (
                        <div className="absolute inset-0 rounded">
                          <div
                            className="h-full bg-white bg-opacity-30 rounded"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                      
                      <span className="text-xs text-white font-medium truncate relative z-10">
                        {position.width > 60 ? item.title : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-neutral-200 bg-neutral-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Projects</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>To Do</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>Backlog</span>
            </div>
          </div>
          <div className="text-xs text-neutral-500">
            💡 Drag issue bars to reschedule
          </div>
        </div>
      </div>
    </div>
  );
}