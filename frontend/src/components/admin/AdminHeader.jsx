import {
  Bell,
  ChevronDown,
  Search,
} from "lucide-react";

function AdminHeader() {
  return (
    <header className="staff-header">

      <div className="staff-header__search">
        <Search size={14} />

        <input
          type="text"
          placeholder="Search animals, applications, or reports..."
        />
      </div>


      <div className="staff-header__actions">

        <button
          type="button"
          className="staff-header__icon"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>


        <div className="staff-header__profile">

          <div className="staff-header__avatar">
            S
          </div>

          <span>
            Staff
          </span>

          <ChevronDown size={14} />

        </div>

      </div>

    </header>
  );
}

export default AdminHeader;