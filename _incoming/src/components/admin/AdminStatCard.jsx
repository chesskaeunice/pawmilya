import { ChevronRight } from "lucide-react";

function AdminStatCard({
  value,
  label,
}) {
  return (
    <article className="dashboard-stat">

      <strong>
        {value}
      </strong>

      <span>
        {label}
      </span>

      <ChevronRight
        size={15}
        className="dashboard-stat__arrow"
      />

    </article>
  );
}

export default AdminStatCard;