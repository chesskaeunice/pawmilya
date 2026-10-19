import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  PawPrint,
  ClipboardList,
  Search,
  Syringe,
  ChartNoAxesColumnIncreasing,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/admin/animals",
    label: "Animals",
    icon: PawPrint,
  },
  {
    path: "/admin/adoption-applications",
    label: "Adoption Applications",
    icon: ClipboardList,
  },
  {
    path: "/admin/missing-pets",
    label: "Missing Pets",
    icon: Search,
  },
  {
    path: "/admin/vaccinations",
    label: "Vaccinations",
    icon: Syringe,
  },
  {
    path: "/admin/reports",
    label: "Reports",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    path: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];

function AdminSidebar() {
  return (
    <aside className="staff-sidebar">

      <div className="staff-sidebar__brand">
        <div className="staff-sidebar__logo">
          P
        </div>

        <div>
          <strong>PAWmilya</strong>

          <span>
            RESCUE · REUNITE · REHOME
          </span>
        </div>
      </div>


      <nav className="staff-sidebar__nav">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "staff-sidebar__link staff-sidebar__link--active"
                  : "staff-sidebar__link"
              }
            >
              <Icon size={15} strokeWidth={1.7} />

              <span>
                {item.label}
              </span>
            </NavLink>
          );
        })}

      </nav>

    </aside>
  );
}

export default AdminSidebar;