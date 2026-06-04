import { useState } from "react";
import type { ChangeEvent } from "react";
import type { Task, TaskStatus } from "../types";

interface Props {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isUpdating: boolean;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

function statusClass(status: TaskStatus) {
  if (status === "in_progress") return "status-progress";
  if (status === "completed") return "status-done";
  return "status-todo";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TaskRow({
  task,
  onStatusChange,
  isUpdating,
}: {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isUpdating: boolean;
}) {
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null);

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as TaskStatus;
    setPendingStatus(next);
    onStatusChange(task.id, next);
  }

  const displayStatus = pendingStatus ?? task.status;

  return (
    <div className="task-item" data-testid="task-item">
      <div className="task-left">
        <div className="task-top">
          <span className={`task-title ${task.status === "completed" ? "done" : ""}`}>
            {task.title}
          </span>
          <span className={`badge priority-${task.priority}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
        <p className="task-description">{task.description}</p>
        <div className="task-footer">
          <span className="task-due">Due {formatDate(task.dueDate)}</span>
        </div>
      </div>

      <select
        className={`status-select ${statusClass(displayStatus)}`}
        value={displayStatus}
        onChange={handleChange}
        disabled={isUpdating}
        aria-label={`Change status for ${task.title}`}
        data-testid="status-select"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TaskList({ tasks, onStatusChange, isUpdating }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">No tasks assigned to this student yet.</div>
    );
  }

  // Sort: urgent first, then high, medium, low — then by due date
  const sorted = [...tasks].sort((a, b) => {
    const pOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const pDiff = pOrder[a.priority] - pOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="task-list">
      {sorted.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
}
