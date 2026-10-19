import { Routes, Route, Navigate } from "react-router-dom";

/* LAYOUTS */
import UserLayout from "../layouts/UserLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";

/* USER PAGES */
import Home from "../pages/user/Home/Home.jsx";
import Login from "../pages/user/Login/Login.jsx";
import Signup from "../pages/user/Signup/Signup.jsx";

import AdoptablePets from "../pages/user/AdoptablePets/AdoptablePets.jsx";
import PetDetails from "../pages/user/PetDetails/PetDetails.jsx";
import AdoptionApplication from "../pages/user/AdoptionApplication/AdoptionApplication.jsx";

import MyApplications from "../pages/user/MyApplications/MyApplications.jsx";

import MissingPets from "../pages/user/MissingPets/MissingPets.jsx";
import MissingPetDetails from "../pages/user/MissingPetDetails/MissingPetDetails.jsx";
import ReportMissingPet from "../pages/user/ReportMissingPet/ReportMissingPet.jsx";

import Profile from "../pages/user/Profile/Profile.jsx";

import Articles from "../pages/user/Articles/Articles.jsx";
import LegalPage from "../pages/user/LegalPage/LegalPage.jsx";
import ArticleDetails from "../pages/user/ArticleDetails/ArticleDetails.jsx";
import RequireSignIn from "../components/common/RequireSignIn.jsx";
import MockLoginHandler from "../components/common/MockLoginHandler.jsx";

/* STAFF PAGES */
import AdoptionCounselorDashboard from "../pages/admin/dashboards/AdoptionCounselorDashboard.jsx";
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


function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          USER SIDE
      ========================== */}

      <Route element={<UserLayout />}>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={
            <MockLoginHandler>
              <Login />
            </MockLoginHandler>
          }
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/adoptable-pets"
          element={<AdoptablePets />}
        />

        <Route
          path="/adoptable-pets/:petId"
          element={<PetDetails />}
        />

        <Route
          path="/adoptable-pets/:petId/apply"
          element={
            <RequireSignIn
              reason="You need an account to apply for adoption."
              fallback={({ petId }) => `/adoptable-pets/${petId}`}
            >
              <AdoptionApplication />
            </RequireSignIn>
          }
        />

        <Route
          path="/my-applications"
          element={
            <RequireSignIn reason="You need an account to view your adoption applications.">
              <MyApplications />
            </RequireSignIn>
          }
        />

        <Route
          path="/missing-pets"
          element={<MissingPets />}
        />

        <Route
          path="/missing-pets/:reportId"
          element={<MissingPetDetails />}
        />

        <Route
          path="/missing-pets/report"
          element={<ReportMissingPet />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/articles"
          element={<Articles />}
        />

        <Route
          path="/privacy-policy"
          element={<LegalPage slug="privacy-policy" />}
        />

        <Route
          path="/terms-of-service"
          element={<LegalPage slug="terms-of-service" />}
        />

        <Route
          path="/adoption-policy"
          element={<LegalPage slug="adoption-policy" />}
        />

        <Route
          path="/articles/:articleId"
          element={<ArticleDetails />}
        />

      </Route>


      {/* =====================================
          STAFF SIDE
      ====================================== */}

      <Route element={<AdminLayout />}>

        {/* =================================
            ADMIN ROOT
        ================================== */}

        <Route
          path="/admin"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <Dashboard />
          }
        />

        <Route
          path="/admin/dashboard/adoption-counselor"
          element={<AdoptionCounselorDashboard />}
        />


        {/* =================================
            ANIMALS
        ================================== */}

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


        {/* =================================
            ADOPTION APPLICATIONS
        ================================== */}

        <Route
          path="/admin/adoption-applications"
          element={
            <AdoptionApplications />
          }
        />


        <Route
          path="/admin/adoption-applications/:applicationId"
          element={
            <AdoptionApplicationDetails />
          }
        />


        {/* =================================
            MISSING PET REPORTS
        ================================== */}

        <Route
          path="/admin/missing-pets"
          element={
            <MissingPetReports />
          }
        />


        <Route
          path="/admin/missing-pets/:reportId"
          element={
            <MissingPetReportDetails />
          }
        />


        {/* =================================
            VACCINATIONS
        ================================== */}

        <Route
          path="/admin/vaccinations"
          element={<Vaccinations />}
        />


        {/* =================================
            REPORTS
        ================================== */}

        <Route
          path="/admin/reports"
          element={<Reports />}
        />


        {/* =================================
            SETTINGS
        ================================== */}

        <Route
          path="/admin/settings"
          element={<Settings />}
        />

      </Route>

    </Routes>
  );
}


export default AppRoutes;