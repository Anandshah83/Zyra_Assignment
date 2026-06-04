import type { Student, UrgencyLevel } from "../types";
import { UrgencyBadge } from "./UrgencyBadge";

interface Props {
  student: Student;
  unreadMessages: number;
  urgencyLevel: UrgencyLevel;
}

const enrollmentLabels = {
  active: "Active",
  at_risk: "At Risk",
};

export function StudentProfile({ student, unreadMessages, urgencyLevel }: Props) {
  return (
    <div className="profile-card" data-testid="student-profile">
      {/* Avatar is initials-based since mock data has no avatar field */}
      <div className="profile-avatar">
        {student.name.split(" ").map((n) => n[0]).join("")}
      </div>

      <div className="profile-details">
        <h1 className="profile-name">{student.name}</h1>
        <p className="profile-school">{student.email}</p>

        <div className="profile-meta">
          <div className="meta-item">
            <span className="meta-label">Grade</span>
            <span className="meta-value">{student.grade}th</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">GPA</span>
            <span className="meta-value">{student.gpa.toFixed(1)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Status</span>
            <span className="meta-value">{enrollmentLabels[student.enrollmentStatus]}</span>
          </div>
        </div>
      </div>

      <div className="profile-badges">
        <UrgencyBadge level={urgencyLevel} />
        {unreadMessages > 0 && (
          <span className="unread-badge" data-testid="unread-badge">
            {unreadMessages} unread {unreadMessages === 1 ? "message" : "messages"}
          </span>
        )}
      </div>
    </div>
  );
}
