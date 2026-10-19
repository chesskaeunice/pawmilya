import {
  Route,
  Routes,
} from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout.jsx";

import Dashboard from "../pages/admin/Dashboard/Dashboard.jsx";

import Animals from "../pages/admin/Animals/Animals.jsx";
import AddAnimal from "../pages/admin/AddAnimal/AddAnimal.jsx";
import AnimalDetails from "../pages/admin/AnimalDetails/AnimalDetails.jsx";
import EditAnimal from "../pages/admin/EditAnimal/EditAnimal.jsx";

import AdoptionApplications from "../pages/admin/AdoptionApplications/AdoptionApplications.jsx";
import AdoptionApplicationDetails from "../pages/admin/AdoptionApplicationDetails/AdoptionApplicationDetails.jsx";

import MissingPetReports from "../pages/admin/MissingPetReports/MissingPetReports.jsx";
import MissingPetReportDetails from "../pages/admin/MissingPetReportDetails/MissingPetReportDetails.jsx";

import Vaccinations from "../pages/admin/Vaccinations/Vaccinations.jsx";

import Reports from "../pages/admin/Reports/Reports.jsx";

import Settings from "../pages/admin/Settings/Settings.jsx";

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route
          path="/admin/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/admin/animals"
          element={<Animals />}
        />

        <Route
          path="/admin/animals/add"
          element={<AddAnimal />}
        />

        <Route
          path="/admin/animals/:animalId"
          element={<AnimalDetails />}
        />

        <Route
          path="/admin/animals/:animalId/edit"
          element={<EditAnimal />}
        />

        <Route
          path="/admin/adoption-applications"
          element={<AdoptionApplications />}
        />

        <Route
          path="/admin/adoption-applications/:applicationId"
          element={
            <AdoptionApplicationDetails />
          }
        />

        <Route
          path="/admin/missing-pets"
          element={<MissingPetReports />}
        />

        <Route
          path="/admin/missing-pets/:reportId"
          element={
            <MissingPetReportDetails />
          }
        />

        <Route
          path="/admin/vaccinations"
          element={<Vaccinations />}
        />

        <Route
          path="/admin/reports"
          element={<Reports />}
        />

        <Route
          path="/admin/settings"
          element={<Settings />}
        />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;