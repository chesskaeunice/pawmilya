import { Routes, Route, Navigate } from "react-router-dom";

/* LAYOUTS */
import UserLayout from "../layouts/UserLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import RequirePermission from "../components/admin/RequirePermission.jsx";

/* USER PAGES */
import Home from "../pages/user/Home/Home.jsx";
import Login from "../pages/user/Login/Login.jsx";
import Signup from "../pages/user/Signup/Signup.jsx";
import {
  ChangePassword,
  ForgotPassword,
  ResetPassword,
} from "../pages/user/PasswordPages/PasswordPages.jsx";
import VerifyEmail from "../pages/user/VerifyEmail/VerifyEmail.jsx";
import StrayInfo from "../pages/user/StrayInfo/StrayInfo.jsx";

import AdoptablePets from "../pages/user/AdoptablePets/AdoptablePets.jsx";
import PetDetails from "../pages/user/PetDetails/PetDetails.jsx";
import AdoptionApplication from "../pages/user/AdoptionApplication/AdoptionApplication.jsx";

import MyApplications from "../pages/user/MyApplications/MyApplications.jsx";
import MyMissingPetReports from "../pages/user/MyMissingPetReports/MyMissingPetReports.jsx";

import MissingPets from "../pages/user/MissingPets/MissingPets.jsx";
import MissingPetDetails from "../pages/user/MissingPetDetails/MissingPetDetails.jsx";
import ReportMissingPet from "../pages/user/ReportMissingPet/ReportMissingPet.jsx";

import Profile from "../pages/user/Profile/Profile.jsx";

import Articles from "../pages/user/Articles/Articles.jsx";
import LegalPage from "../pages/user/LegalPage/LegalPage.jsx";
import ArticleDetails from "../pages/user/ArticleDetails/ArticleDetails.jsx";
import RequireSignIn from "../components/common/RequireSignIn.jsx";

/* STAFF PAGES */
import AdoptionCounselorDashboard from "../pages/admin/dashboards/AdoptionCounselorDashboard.jsx";
import Dashboard from "../pages/admin/Dashboard/Dashboard.jsx";

import Animals from "../pages/admin/Animals/Animals.jsx";
import AddAnimal from "../pages/admin/AddAnimal/AddAnimal.jsx";
import AnimalDetails from "../pages/admin/AnimalDetails/AnimalDetails.jsx";
import CollarTag from "../pages/admin/CollarTag/CollarTag.jsx";
import EditAnimal from "../pages/admin/EditAnimal/EditAnimal.jsx";

import AdoptionApplications from "../pages/admin/AdoptionApplications/AdoptionApplications.jsx";
import AdoptionApplicationDetails from "../pages/admin/AdoptionApplicationDetails/AdoptionApplicationDetails.jsx";

import MissingPetReports from "../pages/admin/MissingPetReports/MissingPetReports.jsx";
import MissingPetReportDetails from "../pages/admin/MissingPetReportDetails/MissingPetReportDetails.jsx";

import Vaccinations from "../pages/admin/Vaccinations/Vaccinations.jsx";

import Reports from "../pages/admin/Reports/Reports.jsx";

import Settings from "../pages/admin/Settings/Settings.jsx";
import StaffSchedule from "../pages/admin/StaffSchedule/StaffSchedule.jsx";
import AuditLogs from "../pages/admin/AuditLogs/AuditLogs.jsx";


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
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route
          path="/stray/:token"
          element={<StrayInfo />}
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
          path="/my-missing-reports"
          element={
            <RequireSignIn reason="You need an account to view your missing pet reports.">
              <MyMissingPetReports />
            </RequireSignIn>
          }
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
          element={
            <RequireSignIn reason="You need an account to view your profile.">
              <Profile />
            </RequireSignIn>
          }
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
          element={<RequirePermission permission="dashboard.view"><Dashboard /></RequirePermission>}
        />

        <Route
          path="/admin/dashboard/adoption-counselor"
          element={<RequirePermission permission="dashboard.view"><AdoptionCounselorDashboard /></RequirePermission>}
        />


        {/* =================================
            ANIMALS
        ================================== */}

        <Route
          path="/admin/animals"
          element={<RequirePermission permission="animals.view"><Animals /></RequirePermission>}
        />


        <Route
          path="/admin/animals/add"
          element={<RequirePermission permission="animals.create"><AddAnimal /></RequirePermission>}
        />


        <Route
          path="/admin/animals/:animalId"
          element={<RequirePermission permission="animals.view"><AnimalDetails /></RequirePermission>}
        />


        <Route
          path="/admin/animals/:animalId/collar-tag"
          element={<RequirePermission permission="qr.view"><CollarTag /></RequirePermission>}
        />

        <Route
          path="/admin/animals/:animalId/edit"
          element={<RequirePermission anyOf={["animals.edit", "animals.photo", "animals.neuteredUpdate"]}><EditAnimal /></RequirePermission>}
        />


        {/* =================================
            ADOPTION APPLICATIONS
        ================================== */}

        <Route
          path="/admin/adoption-applications"
          element={<RequirePermission permission="adoptionApplications.view"><AdoptionApplications /></RequirePermission>}
        />


        <Route
          path="/admin/adoption-applications/:applicationId"
          element={<RequirePermission permission="adoptionApplications.view"><AdoptionApplicationDetails /></RequirePermission>}
        />


        {/* =================================
            MISSING PET REPORTS
        ================================== */}

        <Route
          path="/admin/missing-pets"
          element={<RequirePermission permission="missingPets.view"><MissingPetReports /></RequirePermission>}
        />


        <Route
          path="/admin/missing-pets/:reportId"
          element={<RequirePermission permission="missingPets.view"><MissingPetReportDetails /></RequirePermission>}
        />


        {/* =================================
            VACCINATIONS
        ================================== */}

        <Route
          path="/admin/vaccinations"
          element={<RequirePermission permission="vaccinations.view"><Vaccinations /></RequirePermission>}
        />


        {/* =================================
            REPORTS
        ================================== */}

        <Route
          path="/admin/reports"
          element={<RequirePermission permission="reports.view"><Reports /></RequirePermission>}
        />


        {/* =================================
            SETTINGS
        ================================== */}

        <Route
          path="/admin/settings"
          element={<RequirePermission permission="settings.view"><Settings /></RequirePermission>}
        />


        {/* =================================
            STAFF SCHEDULE AND AUDIT LOGS (kennel manager)
        ================================== */}

        <Route
          path="/admin/staff-schedule"
          element={<RequirePermission permission="shifts.manage"><StaffSchedule /></RequirePermission>}
        />

        <Route
          path="/admin/audit-logs"
          element={<RequirePermission permission="settings.system"><AuditLogs /></RequirePermission>}
        />

      </Route>

    </Routes>
  );
}


export default AppRoutes;