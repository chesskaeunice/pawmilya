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
} from "lucide-react";

import useAuth from "../../hooks/useAuth.js";

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


// collapsed: icons only (the name is the tooltip). hidden: the closed drawer on phones.
// onNavigate: called when a menu link is clicked (the drawer closes).
function AdminSidebar({
  collapsed = false,
  hidden = false,
  onNavigate,
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


  function handleLogout() {
    // Manual logout goes to the homepage (replace: no admin page stays in the history);
    // AdminLayout also sends the guest to "/" after a manual logout, not to /login
    navigate("/", { replace: true });
    logout();
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

        <div className="staff-sidebar__logo">
          P
        </div>


        <div>

          <strong>
            PAWmilya
          </strong>


          <span>
            RESCUE · REUNITE · REHOME
          </span>

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


      {/* WHO IS LOGGED IN, then LOG OUT */}

      <div className="staff-sidebar__role">

        <div
          className="staff-sidebar__profile"
          title={collapsed ? `${name}, ${roleLabel}` : undefined}
        >

          <div className="staff-sidebar__avatar" aria-hidden="true">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="staff-sidebar__photo" />
            ) : (
              name.charAt(0).toUpperCase() || "S"
            )}
          </div>

          <div className="staff-sidebar__identity">
            <strong>{name}</strong>
            <span>{roleLabel}</span>
          </div>

        </div>

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