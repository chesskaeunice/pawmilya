import {
  Save,
} from "lucide-react";

import "./Settings.css";

function Settings() {
  return (
    <div className="staff-page">
      <div className="staff-page__top">
        <div>
          <p className="staff-page__breadcrumb">
            Settings
          </p>

          <h1 className="staff-page__title">
            Settings
          </h1>

          <p className="staff-page__subtitle">
            Manage basic Pawmilya system information and preferences.
          </p>
        </div>
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

      <div className="settings__actions">
        <button className="staff-button">
          <Save size={13} />
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default Settings;