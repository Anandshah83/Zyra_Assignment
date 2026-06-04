import { useStudentStore } from "../store/studentStore";

// Student list matches the official mock data exactly
const STUDENTS = [
  { id: "stu_001", name: "Maya Patel", grade: 11 },
  { id: "stu_002", name: "Jordan Lee", grade: 12 },
  { id: "stu_003", name: "Carlos Rivera", grade: 10 },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("");
}

export function Sidebar() {
  const { selectedStudentId, setSelectedStudentId } = useStudentStore();

  return (
    <aside className="sidebar">
      <p className="sidebar-section-label">My Students</p>
      <div className="student-list">
        {STUDENTS.map((s) => (
          <button
            key={s.id}
            className={`student-card-btn ${selectedStudentId === s.id ? "active" : ""}`}
            onClick={() => setSelectedStudentId(s.id)}
            aria-pressed={selectedStudentId === s.id}
          >
            <div className="student-avatar">{getInitials(s.name)}</div>
            <div className="student-info">
              <div className="student-name">{s.name}</div>
              <div className="student-grade">Grade {s.grade}</div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
