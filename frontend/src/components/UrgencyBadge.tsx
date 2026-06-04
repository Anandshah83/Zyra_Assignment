import type { UrgencyLevel } from "../types";

interface Props {
  level: UrgencyLevel;
}

const labels: Record<UrgencyLevel, string> = {
  critical: "Critical",
  high: "High Priority",
  medium: "Medium",
  low: "Low",
};

export function UrgencyBadge({ level }: Props) {
  return (
    <span className={`badge badge-${level}`} data-testid="urgency-badge">
      <span className="badge-dot" />
      {labels[level]}
    </span>
  );
}
