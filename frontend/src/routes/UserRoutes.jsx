import { Route, Routes } from "react-router-dom";

import UserLayout from "../layouts/UserLayout.jsx";

import Home from "../pages/user/Home/Home.jsx";
import Login from "../pages/user/Login/Login.jsx";
import Signup from "../pages/user/Signup/Signup.jsx";

import AdoptablePets from "../pages/user/AdoptablePets/AdoptablePets.jsx";
import PetDetails from "../pages/user/PetDetails/PetDetails.jsx";
import AdoptionApplication from "../pages/user/AdoptionApplication/AdoptionApplication.jsx";

import MyApplications from "../pages/user/MyApplications/MyApplications.jsx";

import MissingPets from "../pages/user/MissingPets/MissingPets.jsx";
import ReportMissingPet from "../pages/user/ReportMissingPet/ReportMissingPet.jsx";
import MyMissingPetReports from "../pages/user/MyMissingPetReports/MyMissingPetReports.jsx";

import Profile from "../pages/user/Profile/Profile.jsx";


function UserRoutes() {
  return (
    <Routes>

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
          element={<AdoptionApplication />}
        />


        <Route
          path="/my-applications"
          element={<MyApplications />}
        />


        <Route
          path="/missing-pets"
          element={<MissingPets />}
        />

        <Route
          path="/missing-pets/report"
          element={<ReportMissingPet />}
        />

        <Route
          path="/my-missing-pet-reports"
          element={<MyMissingPetReports />}
        />


        <Route
          path="/profile"
          element={<Profile />}
        />

      </Route>

    </Routes>
  );
}

export default UserRoutes;