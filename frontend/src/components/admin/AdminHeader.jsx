import { Menu } from "lucide-react";

// Staff header: just the menu button, shown on phones only (on desktop the hamburger is inside the
// sidebar). The staff member's name and role are at the top of the sidebar.
//   expanded: true while the sidebar is open (drawer open on phones, not collapsed on desktop)
function AdminHeader({ expanded, onToggleMenu, buttonRef }) {
  return (
    <header className="staff-header">

      <button
        type="button"
        ref={buttonRef}
        className="staff-header__menu"
        onClick={onToggleMenu}
        aria-label={expanded ? "Close menu" : "Open menu"}
        aria-expanded={expanded}
        aria-controls="staff-sidebar"
      >
        <Menu size={20} strokeWidth={1.8} aria-hidden="true" />
      </button>

    </header>
  );
}

export default AdminHeader;
