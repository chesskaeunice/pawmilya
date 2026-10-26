import { Menu } from "lucide-react";

// Staff header: just the menu button (the sidebar's hamburger). The staff member's name and role
// are at the bottom of the sidebar, next to Log out.
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
