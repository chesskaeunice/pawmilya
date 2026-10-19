import useAuth from "../../../hooks/useAuth.js";
import { ROLES } from "../../../config/rolePermissions.js";

import KennelManagerDashboard from "../dashboards/KennelManagerDashboard.jsx";
import AdoptionCounselorDashboard from "../dashboards/AdoptionCounselorDashboard.jsx";
import VetTechDashboard from "../dashboards/VetTechDashboard.jsx";
import PoundStaffDashboard from "../dashboards/PoundStaffDashboard.jsx";

function Dashboard() {
  const { role } = useAuth();

  switch (role) {
    case ROLES.KENNEL_MANAGER:
      return <KennelManagerDashboard />;

    case ROLES.ADOPTION_COUNSELOR:
      return <AdoptionCounselorDashboard />;

    case ROLES.VET_TECH:
      return <VetTechDashboard />;

    case ROLES.POUND_STAFF:
      return <PoundStaffDashboard />;

    default:
      return <PoundStaffDashboard />;
  }
}

export default Dashboard;