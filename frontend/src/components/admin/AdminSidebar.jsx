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


function AdminSidebar() {
  const {
    can,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();


  function handleLogout() {
    logout();
    navigate("/login");
  }


  const visibleMenuItems =
    menuItems.filter(
      (item) =>
        can(item.permission)
    );


  return (
    <aside className="staff-sidebar">

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


      {/* LOG OUT (name and role are shown once, in the header) */}

      <div className="staff-sidebar__role">

        <button
          type="button"
          className="staff-sidebar__logout"
          onClick={handleLogout}
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