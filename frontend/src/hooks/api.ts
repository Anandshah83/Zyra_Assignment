import type { ActionCenterData, TaskStatus } from "../types";

const API_BASE = "/students";
const TASKS_BASE = "/tasks";

export async function fetchActionCenter(
  studentId: string
): Promise<ActionCenterData> {
  const res = await fetch(`${API_BASE}/${studentId}/action-center`);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to load student data (${res.status})`);
  }

  return res.json();
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<void> {
  const res = await fetch(`${TASKS_BASE}/${taskId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to update task (${res.status})`);
  }
}
