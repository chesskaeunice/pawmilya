import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings, User } from "lucide-react";

import { sectionLinks, siteInfo } from "../../data/siteInfo.js";
import useActiveSection from "../../hooks/useActiveSection.js";
import useAuth from "../../hooks/useAuth.js";
import { useGoToSection } from "../../hooks/useSectionScroll.js";

import "./UserNavbar.css";

const sectionIds = sectionLinks.map((link) => link.id);

// Page link only logged-in users see (the rest are landing sections)
const myApplicationsLink = {
  id: "my-applications",
  label: "My Applications",
  path: "/my-applications",
  isPage: true,
};

const myMissingReportsLink = {
  id: "my-missing-reports",
  label: "My Reports",
  path: "/my-missing-reports",
  isPage: true,
};

// Guest:  Home, Adoptable Pets, Missing Pets, About Us
// Citizen: Home, Adoptable Pets, My Applications, Missing Pets, About Us
function getLinks(isLoggedIn) {
  if (!isLoggedIn) return sectionLinks;

  return sectionLinks.flatMap((link) => {
    if (link.id === "adoptable-pets") return [link, myApplicationsLink];
    if (link.id === "missing-pets") return [link, myMissingReportsLink];
    return [link];
  });
}

// Same structure and classes as the original UserNavbar (.user-navbar in
// styles/user-layout.css). Guests have no account buttons; a logged-in user
// gets an avatar menu at the far right.
function UserNavbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const activeId = useActiveSection(sectionIds);
  const goToSection = useGoToSection();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef(null);
  const avatarRef = useRef(null);
  const menuRef = useRef(null);

  const links = getLinks(isLoggedIn);

  const menuItems = () =>
    Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') || []);

  const closeMenu = (returnFocus = false) => {
    setMenuOpen(false);
    if (returnFocus) avatarRef.current?.focus();
  };

  // close on outside click/tap, and on Escape wherever focus is
  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointer = (event) => {
      if (!menuWrapRef.current?.contains(event.target)) setMenuOpen(false);
    };

    const handleKey = (event) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      avatarRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const handleLinkClick = (event, link) => {
    // page links navigate normally; section links scroll on the landing page
    if (link.isPage) return;

    event.preventDefault();
    goToSection(link);
  };

  const openMenuWithKeyboard = (event) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setMenuOpen(true);
      // focus the first item once the menu is on screen
      requestAnimationFrame(() => menuItems()[0]?.focus());
    }
  };

  const handleMenuKeyDown = (event) => {
    const items = menuItems();
    const index = items.indexOf(document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    } else if (event.key === "Tab") {
      closeMenu();
    }
  };

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/");
  };

  return (
    <header className="user-navbar">
      <div className="user-navbar__container">

        <Link
          to="/"
          className="user-navbar__brand"
          onClick={(event) => handleLinkClick(event, sectionLinks[0])}
        >
          <span className="user-navbar__logo">
            P
          </span>

          <span>
            {siteInfo.brandName}
          </span>
        </Link>


        <nav className="user-navbar__links" aria-label="Main">

          {links.map((link) => (
            <Link
              key={link.id}
              to={link.isPage ? link.path : `/#${link.id}`}
              className={
                activeId === link.id
                  ? "user-navbar__link user-navbar__link--active"
                  : "user-navbar__link"
              }
              aria-current={activeId === link.id ? "page" : undefined}
              onClick={(event) => handleLinkClick(event, link)}
            >
              {link.label}
            </Link>
          ))}

        </nav>


        <div className="user-navbar__actions">

          {!isLoggedIn && (
            <Link to="/login" className="user-navbar__login">
              Log In
            </Link>
          )}

          {isLoggedIn && (
            <div className="user-menu" ref={menuWrapRef}>
              <button
                type="button"
                ref={avatarRef}
                className="user-menu__avatar"
                onClick={() => setMenuOpen((open) => !open)}
                onKeyDown={openMenuWithKeyboard}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-controls="user-menu-list"
                aria-label="Account menu"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="user-menu__photo" />
                ) : (
                  <User size={20} aria-hidden="true" />
                )}
              </button>

              {menuOpen && (
                <div
                  id="user-menu-list"
                  className="user-menu__dropdown"
                  role="menu"
                  aria-label="Account"
                  ref={menuRef}
                  onKeyDown={handleMenuKeyDown}
                >
                  <Link
                    to="/profile"
                    role="menuitem"
                    className="user-menu__item"
                    onClick={() => closeMenu()}
                  >
                    <Settings size={16} aria-hidden="true" />
                    Account Settings
                  </Link>

                  <button
                    type="button"
                    role="menuitem"
                    className="user-menu__item"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
}

export default UserNavbar;
