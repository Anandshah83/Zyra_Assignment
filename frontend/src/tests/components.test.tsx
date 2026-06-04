import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UrgencyBadge } from "../components/UrgencyBadge";
import { StudentProfile } from "../components/StudentProfile";
import { TaskList } from "../components/TaskList";
import { ActionCenter } from "../components/ActionCenter";
import type { Student, Task } from "../types";

// --- UrgencyBadge ---

describe("UrgencyBadge", () => {
  it("renders the correct label for each urgency level", () => {
    const { rerender } = render(<UrgencyBadge level="critical" />);
    expect(screen.getByTestId("urgency-badge")).toHaveTextContent("Critical");

    rerender(<UrgencyBadge level="high" />);
    expect(screen.getByTestId("urgency-badge")).toHaveTextContent("High Priority");

    rerender(<UrgencyBadge level="low" />);
    expect(screen.getByTestId("urgency-badge")).toHaveTextContent("Low");
  });

  it("applies the correct CSS class for each level", () => {
    const { rerender } = render(<UrgencyBadge level="critical" />);
    expect(screen.getByTestId("urgency-badge")).toHaveClass("badge-critical");

    rerender(<UrgencyBadge level="medium" />);
    expect(screen.getByTestId("urgency-badge")).toHaveClass("badge-medium");
  });
});

// --- StudentProfile ---

// Uses exact shape from official Zyra mock data (no avatar/school fields)
const mockStudent: Student = {
  id: "stu_001",
  name: "Maya Patel",
  email: "maya.patel@school.edu",
  grade: 11,
  gpa: 3.2,
  counselorId: "csl_001",
  enrollmentStatus: "at_risk",
};

describe("StudentProfile", () => {
  it("renders the student name and email", () => {
    render(
      <StudentProfile student={mockStudent} unreadMessages={2} urgencyLevel="critical" />
    );
    expect(screen.getByText("Maya Patel")).toBeInTheDocument();
    expect(screen.getByText("maya.patel@school.edu")).toBeInTheDocument();
  });

  it("shows the unread message count when there are unread messages", () => {
    render(
      <StudentProfile student={mockStudent} unreadMessages={2} urgencyLevel="high" />
    );
    expect(screen.getByTestId("unread-badge")).toHaveTextContent("2 unread messages");
  });

  it("hides the unread badge when count is zero", () => {
    render(
      <StudentProfile student={mockStudent} unreadMessages={0} urgencyLevel="low" />
    );
    expect(screen.queryByTestId("unread-badge")).not.toBeInTheDocument();
  });

  it("shows singular 'message' when count is 1", () => {
    render(
      <StudentProfile student={mockStudent} unreadMessages={1} urgencyLevel="medium" />
    );
    expect(screen.getByTestId("unread-badge")).toHaveTextContent("1 unread message");
  });

  it("displays the correct urgency badge", () => {
    render(
      <StudentProfile student={mockStudent} unreadMessages={0} urgencyLevel="critical" />
    );
    expect(screen.getByTestId("urgency-badge")).toHaveTextContent("Critical");
  });
});

// --- TaskList ---

// Uses exact field shape from official Zyra mock data
const mockTasks: Task[] = [
  {
    id: "tsk_001",
    studentId: "stu_001",
    title: "Submit FAFSA application",
    description: "Deadline is approaching. Student has not started the form.",
    status: "todo",
    priority: "urgent",
    dueDate: "2026-06-05",
    createdAt: "2026-05-13T14:00:00Z",
    updatedAt: "2026-05-13T14:00:00Z",
  },
  {
    id: "tsk_002",
    studentId: "stu_001",
    title: "Meet with math tutor",
    description: "Failing algebra — tutoring sessions must begin immediately.",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-06-01",
    createdAt: "2026-05-21T09:00:00Z",
    updatedAt: "2026-05-30T16:30:00Z",
  },
];

const mockActionCenterData = {
  student: mockStudent,
  tasks: [
    { ...mockTasks[0], status: "completed" },
    { ...mockTasks[1], status: "in_progress" },
    { ...mockTasks[1], id: "tsk_003", status: "completed" },
  ],
  unreadMessages: 1,
  urgencyLevel: "high" as const,
};

vi.mock("../hooks/useActionCenter", () => ({
  useActionCenter: () => ({
    data: mockActionCenterData,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useUpdateTaskStatus: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
}));

describe("TaskList", () => {
  it("renders all tasks", () => {
    render(
      <TaskList tasks={mockTasks} onStatusChange={vi.fn()} isUpdating={false} />
    );
    expect(screen.getAllByTestId("task-item")).toHaveLength(2);
    expect(screen.getByText("Submit FAFSA application")).toBeInTheDocument();
    expect(screen.getByText("Meet with math tutor")).toBeInTheDocument();
  });

  it("shows an empty message when there are no tasks", () => {
    render(<TaskList tasks={[]} onStatusChange={vi.fn()} isUpdating={false} />);
    expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
  });

  it("calls onStatusChange with correct task ID and status on dropdown change", () => {
    const handleChange = vi.fn();
    render(
      <TaskList tasks={mockTasks} onStatusChange={handleChange} isUpdating={false} />
    );

    // urgent priority sorts first, so tsk_001 is the first dropdown
    const selects = screen.getAllByTestId("status-select");
    fireEvent.change(selects[0], { target: { value: "completed" } });

    expect(handleChange).toHaveBeenCalledOnce();
    expect(handleChange).toHaveBeenCalledWith("tsk_001", "completed");
  });

  it("disables all dropdowns while an update is in progress", () => {
    render(
      <TaskList tasks={mockTasks} onStatusChange={vi.fn()} isUpdating={true} />
    );
    screen.getAllByTestId("status-select").forEach((s) => {
      expect(s).toBeDisabled();
    });
  });

  it("applies strikethrough style to completed tasks", () => {
    const completedTasks: Task[] = [
      { ...mockTasks[0], status: "completed" },
    ];
    render(
      <TaskList tasks={completedTasks} onStatusChange={vi.fn()} isUpdating={false} />
    );
    expect(screen.getByText("Submit FAFSA application")).toHaveClass("done");
  });
});

describe("ActionCenter", () => {
  it("shows the correct completed task count", () => {
    render(<ActionCenter studentId="stu_001" />);
    expect(screen.getByText("2/3 complete")).toBeInTheDocument();
  });
});
