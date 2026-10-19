import {
  NavLink,
} from "react-router-dom";

import {
  LayoutDashboard,
  PawPrint,
  ClipboardList,
  Search,
  Syringe,
  ChartNoAxesColumnIncreasing,
  Settings,
} from "lucide-react";

import {
  useStaffAuth,
} from "../../context/StaffAuthContext.jsx";

import DevRoleSwitcher from "./DevRoleSwitcher.jsx";


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
    roleLabel,
  } = useStaffAuth();


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


      {/* DEV ONLY: preview other roles */}

      <DevRoleSwitcher />


      {/* CURRENT ROLE */}

      <div className="staff-sidebar__role">

        <span>
          Signed in as
        </span>

        <strong>
          {roleLabel}
        </strong>

      </div>

    </aside>
  );
}


export default AdminSidebar;