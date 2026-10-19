import { NavLink } from "react-router-dom";

function UserNavbar() {
  const getLinkClass = ({ isActive }) =>
    isActive
      ? "user-navbar__link user-navbar__link--active"
      : "user-navbar__link";

  return (
    <header className="user-navbar">
      <div className="user-navbar__container">

        <NavLink
          to="/"
          className="user-navbar__brand"
        >
          <span className="user-navbar__logo">
            P
          </span>

          <span>
            PAWmilya
          </span>
        </NavLink>


        <nav className="user-navbar__links">

          <NavLink
            to="/"
            className={getLinkClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/adoptable-pets"
            className={getLinkClass}
          >
            Adoptable Pets
          </NavLink>

          <NavLink
            to="/my-applications"
            className={getLinkClass}
          >
            My Applications
          </NavLink>

          <NavLink
            to="/missing-pets"
            className={getLinkClass}
          >
            Missing Pets
          </NavLink>

          <NavLink
            to="/profile"
            className={getLinkClass}
          >
            Profile
          </NavLink>

        </nav>


        <div className="user-navbar__actions">

          <NavLink
            to="/login"
            className="user-navbar__login"
          >
            Login
          </NavLink>

          <NavLink
            to="/signup"
            className="user-navbar__signup"
          >
            Sign Up
          </NavLink>

        </div>

      </div>
    </header>
  );
}

export default UserNavbar;