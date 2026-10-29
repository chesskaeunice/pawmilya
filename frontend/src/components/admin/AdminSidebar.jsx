import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  PawPrint,
  ClipboardList,
  Search,
  Syringe,
  ChartNoAxesColumnIncreasing,
  Settings,
  LogOut,
  CalendarClock,
  ScrollText,
  Menu,
} from "lucide-react";

import useAuth from "../../hooks/useAuth.js";
import websiteLogo, { smallLogo } from "../../assets/images/logo.js";

const menuItems = [
  {
    path:
      "/admin/dashboard",

    label:
      "Dashboard",

    icon:
      LayoutDashboard,

    permission:
      "dashboard.view",
  },

  {
    path:
      "/admin/animals",

    label:
      "Animals",

    icon:
      PawPrint,

    permission:
      "animals.view",
  },

  {
    path:
      "/admin/adoption-applications",

    label:
      "Adoption Applications",

    icon:
      ClipboardList,

    permission:
      "adoptionApplications.view",
  },

  {
    path:
      "/admin/missing-pets",

    label:
      "Missing Pets",

    icon:
      Search,

    permission:
      "missingPets.view",
  },

  {
    path:
      "/admin/vaccinations",

    label:
      "Vaccinations",

    icon:
      Syringe,

    permission:
      "vaccinations.view",
  },

  {
    path:
      "/admin/reports",

    label:
      "Reports",

    icon:
      ChartNoAxesColumnIncreasing,

    permission:
      "reports.view",
  },

  {
    path:
      "/admin/staff-schedule",

    label:
      "Staff Schedule",

    icon:
      CalendarClock,

    permission:
      "shifts.manage",
  },

  {
    path:
      "/admin/audit-logs",

    label:
      "Audit Logs",

    icon:
      ScrollText,

    permission:
      "settings.system",
  },

  {
    path:
      "/admin/settings",

    label:
      "Settings",

    icon:
      Settings,

    permission:
      "settings.view",
  },
];


// "Maria Santos" -> "MS" (shown when the staff member has no profile photo)
function initialsOf(name) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "S"
  );
}


// collapsed: icons only (the name is the tooltip). hidden: the closed drawer on phones.
// onNavigate: called when a menu link is clicked (the drawer closes).
// expanded / onToggleMenu: the hamburger under the logo (collapse or expand the sidebar).
function AdminSidebar({
  collapsed = false,
  hidden = false,
  onNavigate,
  expanded = true,
  onToggleMenu,
}) {
  const {
    can,
    logout,
    user,
    roleLabel,
  } = useAuth();

  const name = user?.name ?? "";

  const navigate =
    useNavigate();


  async function handleLogout() {
    // Manual logout goes to the homepage (replace: no admin page stays in the history);
    // AdminLayout also sends the guest to "/" after a manual logout, not to /login
    await logout();
    navigate("/", { replace: true });
  }


  const visibleMenuItems =
    menuItems.filter(
      (item) =>
        can(item.permission)
    );


  return (
    <aside
      id="staff-sidebar"
      className="staff-sidebar"
      inert={hidden}
    >

      {/* BRAND */}

      <div className="staff-sidebar__brand">

        <img
          src={collapsed ? smallLogo : websiteLogo}
          alt="PAWmilya"
          className="staff-sidebar__logo"
        />


        <div>

          <span>
            RESCUE · REUNITE · REHOME
          </span>

        </div>

      </div>


      {/* HAMBURGER: same column as the menu icons below it */}

      <div className="staff-sidebar__toggle-row">

        <button
          type="button"
          className="staff-sidebar__toggle"
          onClick={onToggleMenu}
          aria-label={expanded ? "Collapse menu" : "Expand menu"}
          aria-expanded={expanded}
          aria-controls="staff-sidebar"
          title={expanded ? "Collapse menu" : "Expand menu"}
        >
          <Menu
            size={15}
            strokeWidth={1.7}
            aria-hidden="true"
          />
        </button>

      </div>


      {/* WHO IS LOGGED IN: photo (or initials), name and position */}

      <div
        className="staff-sidebar__profile"
        title={collapsed ? `${name}, ${roleLabel}` : undefined}
      >

        <div className="staff-sidebar__avatar" aria-hidden="true">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="staff-sidebar__photo" />
          ) : (
            initialsOf(name)
          )}
        </div>

        <div className="staff-sidebar__identity">
          <strong>{name}</strong>
          <span>{roleLabel}</span>
        </div>

      </div>


      {/* NAVIGATION */}

      <nav className="staff-sidebar__nav">

        {visibleMenuItems.map(
          (item) => {

            const Icon =
              item.icon;


            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                onClick={onNavigate}
                className={({
                  isActive,
                }) =>
                  isActive
                    ? "staff-sidebar__link staff-sidebar__link--active"
                    : "staff-sidebar__link"
                }
              >

                <Icon
                  size={15}
                  strokeWidth={1.7}
                />


                <span>
                  {item.label}
                </span>

              </NavLink>
            );
          }
        )}

      </nav>


      {/* LOG OUT */}

      <div className="staff-sidebar__role">

        <button
          type="button"
          className="staff-sidebar__logout"
          onClick={handleLogout}
          title={collapsed ? "Log out" : undefined}
          aria-label="Log out"
        >
          <LogOut
            size={14}
            strokeWidth={1.7}
          />

          <span>
            Log out
          </span>
        </button>

      </div>

    </aside>
  );
}


export default AdminSidebar;