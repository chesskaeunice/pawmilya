import {
  useState,
} from "react";

import {
  KeyRound,
  Save,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import useAuth from "../../../hooks/useAuth.js";
import {
  ROLE_LABELS,
  ROLES,
} from "../../../config/rolePermissions.js";

import "./Settings.css";


/* Temporary staff accounts until the Laravel users API exists. */
const initialStaffAccounts = [
  {
    id: 1,
    name: "Rafael Dela Cruz",
    email: "manager@pawmilya.local",
    role: ROLES.KENNEL_MANAGER,
    active: true,
  },

  {
    id: 2,
    name: "Angela Reyes",
    email: "counselor@pawmilya.local",
    role: ROLES.ADOPTION_COUNSELOR,
    active: true,
  },

  {
    id: 3,
    name: "Marco Villanueva",
    email: "vettech@pawmilya.local",
    role: ROLES.VET_TECH,
    active: true,
  },

  {
    id: 4,
    name: "Josefina Bautista",
    email: "staff@pawmilya.local",
    role: ROLES.POUND_STAFF,
    active: false,
  },
];


function Settings() {
  const {
    user,
    roleLabel,
    can,
  } = useAuth();

  /* Only the Kennel Manager has system/admin settings. */
  const canManageSystem =
    can("settings.system");

  const [staffAccounts, setStaffAccounts] =
    useState(initialStaffAccounts);


  const changeRole = (id, role) => {
    setStaffAccounts((accounts) =>
      accounts.map((account) =>
        account.id === id
          ? { ...account, role }
          : account
      )
    );
  };


  const toggleActive = (id) => {
    setStaffAccounts((accounts) =>
      accounts.map((account) =>
        account.id === id
          ? { ...account, active: !account.active }
          : account
      )
    );
  };


  return (
    <div className="staff-page">
      <div className="staff-page__top">
        <div>
          <h1 className="staff-page__title">
            Settings
          </h1>

          <p className="staff-page__subtitle">
            {canManageSystem
              ? "Manage your account, system configuration, and staff accounts."
              : "Manage your own account."}
          </p>
        </div>
      </div>


      {/* =====================================
          MY ACCOUNT (ALL ROLES)
      ====================================== */}

      <section className="settings__grid">
        <div className="staff-detail-card">
          <h2 className="staff-detail-card__title">
            My Account
          </h2>

          <div className="settings__fields">
            <label>
              Full Name
              <input
                defaultValue={user.name}
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                defaultValue={user.email}
              />
            </label>

            <label>
              Role
              <input
                value={roleLabel}
                readOnly
                disabled
              />
            </label>

            <label>
              Contact Number
              <input
                placeholder="Contact number"
              />
            </label>
          </div>
        </div>

        <div className="staff-detail-card">
          <h2 className="staff-detail-card__title">
            <KeyRound size={15} />
            Change Password
          </h2>

          <div className="settings__fields settings__fields--single">
            <label>
              Current Password
              <input
                type="password"
                autoComplete="current-password"
              />
            </label>

            <label>
              New Password
              <input
                type="password"
                autoComplete="new-password"
              />
            </label>

            <label>
              Confirm New Password
              <input
                type="password"
                autoComplete="new-password"
              />
            </label>
          </div>
        </div>
      </section>

      <div className="settings__actions">
        <button className="staff-button">
          <Save size={13} />
          Save My Account
        </button>
      </div>


      {/* =====================================
          SYSTEM / ADMIN (KENNEL MANAGER ONLY)
      ====================================== */}

      {canManageSystem && (
        <>
          <div className="settings__divider">
            <ShieldCheck size={15} />

            <span>
              System &amp; Admin Settings
            </span>

            <small>
              Visible to the Kennel Manager only
            </small>
          </div>


          <section className="settings__grid">
            <div className="staff-detail-card">
              <h2 className="staff-detail-card__title">
                Organization Information
              </h2>

              <div className="settings__fields">
                <label>
                  Organization Name
                  <input
                    defaultValue="Pawmilya"
                  />
                </label>

                <label>
                  Contact Number
                  <input
                    placeholder="Contact number"
                  />
                </label>

                <label>
                  Email Address
                  <input
                    type="email"
                    placeholder="Email address"
                  />
                </label>

                <label>
                  Office Address
                  <input
                    placeholder="Office address"
                  />
                </label>
              </div>
            </div>

            <div className="staff-detail-card">
              <h2 className="staff-detail-card__title">
                Adoption Guidelines
              </h2>

              <textarea
                className="settings__textarea"
                rows="10"
                placeholder="Enter adoption policies and requirements..."
              />
            </div>
          </section>


          <section className="staff-detail-card settings__section">
            <h2 className="staff-detail-card__title">
              System Configuration
            </h2>

            <div className="settings__toggles">
              <label className="settings__toggle">
                <input
                  type="checkbox"
                  defaultChecked
                />

                <span>
                  <strong>
                    Accept adoption applications
                  </strong>

                  Citizens can submit new adoption applications.
                </span>
              </label>

              <label className="settings__toggle">
                <input
                  type="checkbox"
                  defaultChecked
                />

                <span>
                  <strong>
                    Accept missing pet reports
                  </strong>

                  Guests and citizens can report missing pets.
                </span>
              </label>

              <label className="settings__toggle">
                <input
                  type="checkbox"
                  defaultChecked
                />

                <span>
                  <strong>
                    Vaccination due reminders
                  </strong>

                  Flag vaccinations as due soon 30 days before their due date.
                </span>
              </label>
            </div>
          </section>


          <section className="staff-detail-card settings__section">
            <h2 className="staff-detail-card__title">
              <UserCog size={15} />
              Staff Accounts &amp; Roles
            </h2>

            <div className="settings__table-wrap">
              <table className="settings__table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {staffAccounts.map((account) => {
                    const isSelf =
                      account.email === user.email;

                    return (
                      <tr key={account.id}>
                        <td>
                          {account.name}
                        </td>

                        <td>
                          {account.email}
                        </td>

                        <td>
                          <select
                            value={account.role}
                            onChange={(event) =>
                              changeRole(
                                account.id,
                                event.target.value
                              )
                            }
                            disabled={isSelf}
                            aria-label={`Role for ${account.name}`}
                          >
                            {Object.values(ROLES).map(
                              (role) => (
                                <option
                                  key={role}
                                  value={role}
                                >
                                  {ROLE_LABELS[role]}
                                </option>
                              )
                            )}
                          </select>
                        </td>

                        <td>
                          <span
                            className={`settings__status ${
                              account.active
                                ? "settings__status--active"
                                : "settings__status--inactive"
                            }`}
                          >
                            {account.active
                              ? "Active"
                              : "Disabled"}
                          </span>
                        </td>

                        <td>
                          <button
                            className="staff-button staff-button--outline"
                            onClick={() =>
                              toggleActive(account.id)
                            }
                            disabled={isSelf}
                          >
                            {account.active
                              ? "Disable"
                              : "Enable"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>


          <div className="settings__actions">
            <button className="staff-button">
              <Save size={13} />
              Save System Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Settings;
