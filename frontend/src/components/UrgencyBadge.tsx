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

// Shows the urgency level as a colored pill with a dot indicator.
// The color mapping matches the CSS variables defined in index.css.
export function UrgencyBadge({ level }: Props) {
  return (
    <span className={`badge badge-${level}`} data-testid="urgency-badge">
      <span className="badge-dot" />
      {labels[level]}
    </span>
  );
}
