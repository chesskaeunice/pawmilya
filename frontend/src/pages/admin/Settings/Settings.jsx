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
import useFetch from "../../../hooks/useFetch.js";
import {
  createStaffAccount,
  listStaffAccounts,
  updateStaffAccount,
} from "../../../services/adminService.js";
import { formatApiError } from "../../../services/authService.js";
import {
  ROLE_LABELS,
  ROLES,
} from "../../../config/rolePermissions.js";

import "./Settings.css";
import BackButton from "../../../components/common/BackButton.jsx";


function Settings() {
  const {
    user,
    roleLabel,
    can,
  } = useAuth();

  /* Only the Kennel Manager has system/admin settings. */
  const canManageSystem =
    can("settings.system");

  /* Staff accounts and roles come from the API (kennel manager only). */
  const { data: accountData, reload } =
    useFetch(
      () =>
        canManageSystem
          ? listStaffAccounts()
          : Promise.resolve([]),
      [canManageSystem]
    );

  const staffAccounts =
    accountData ?? [];

  const [newAccount, setNewAccount] =
    useState({
      name: "",
      email: "",
      role: ROLES.POUND_STAFF,
      password: "",
    });

  const [accountMessage, setAccountMessage] =
    useState("");


  // The API refuses changes like demoting yourself; its message is shown
  const saveChange = async (id, changes) => {
    try {
      await updateStaffAccount(id, changes);
      setAccountMessage("");
    } catch (error) {
      setAccountMessage(
        formatApiError(error).message
      );
    }

    reload();
  };


  const changeRole = (id, role) =>
    saveChange(id, { role });


  const toggleActive = (id) => {
    const account =
      staffAccounts.find(
        (item) => item.id === id
      );

    saveChange(id, {
      is_active: !account.active,
    });
  };


  const createAccount = async (event) => {
    event.preventDefault();

    try {
      await createStaffAccount(newAccount);

      setNewAccount({
        name: "",
        email: "",
        role: ROLES.POUND_STAFF,
        password: "",
      });
      setAccountMessage("Staff account created.");
      reload();
    } catch (error) {
      const { message, fields } =
        formatApiError(error);

      setAccountMessage(
        Object.values(fields)[0] || message
      );
    }
  };


  return (
    <div className="staff-page">
      <BackButton fallback="/admin/dashboard" />

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

            {accountMessage && (
              <p role="status">
                {accountMessage}
              </p>
            )}

            <form
              className="settings__fields"
              onSubmit={createAccount}
            >
              <label>
                Name
                <input
                  value={newAccount.name}
                  onChange={(event) =>
                    setNewAccount({ ...newAccount, name: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={newAccount.email}
                  onChange={(event) =>
                    setNewAccount({ ...newAccount, email: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Role
                <select
                  value={newAccount.role}
                  onChange={(event) =>
                    setNewAccount({ ...newAccount, role: event.target.value })
                  }
                >
                  {Object.values(ROLES).map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Temporary password (min. 10, upper + lower case, number, symbol; changed at first login)
                <input
                  type="password"
                  minLength={10}
                  value={newAccount.password}
                  onChange={(event) =>
                    setNewAccount({ ...newAccount, password: event.target.value })
                  }
                  required
                />
              </label>

              <button type="submit" className="staff-button">
                Add Staff Account
              </button>
            </form>
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
