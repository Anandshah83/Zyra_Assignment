import { useActionCenter, useUpdateTaskStatus } from "../hooks/useActionCenter";
import { StudentProfile } from "./StudentProfile";
import { TaskList } from "./TaskList";
import type { TaskStatus } from "../types";

interface Props {
  studentId: string;
}

export function ActionCenter({ studentId }: Props) {
  const { data, isLoading, isError, error } = useActionCenter(studentId);
  const mutation = useUpdateTaskStatus(studentId);

  function handleStatusChange(taskId: string, status: TaskStatus) {
    mutation.mutate({ taskId, status });
  }

  if (isLoading) {
    return (
      <div className="loading-state" data-testid="loading-state">
        <div className="loading-spinner" />
        <p>Loading student data...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="error-state" data-testid="error-state">
        <p>
          {error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."}
        </p>
      </div>
    );
  }

  const tasksDone = data.tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="action-center">
      <StudentProfile
        student={data.student}
        unreadMessages={data.unreadMessages}
        urgencyLevel={data.urgencyLevel}
      />

      <div className="section-header">
        <span className="section-title">Tasks</span>
        <span className="task-category">
          {tasksDone}/{data.tasks.length} complete
        </span>
      </div>

      {mutation.isError && (
        <p className="update-error">
          Failed to update task. Please try again.
        </p>
      )}

      <TaskList
        tasks={data.tasks}
        onStatusChange={handleStatusChange}
        isUpdating={mutation.isPending}
      />
    </div>
  );
}
