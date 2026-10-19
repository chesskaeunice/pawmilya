import {
  BarChart3,
  Cat,
  Dog,
  Heart,
  PawPrint,
  Search,
  Syringe,
} from "lucide-react";

import pets from "../../../data/pets.js";
import applications from "../../../data/applications.js";
import missingPets from "../../../data/missingPets.js";

import "./Reports.css";

function Reports() {
  return (
    <div className="staff-page">
      <div className="staff-page__top">
        <div>
          <p className="staff-page__breadcrumb">
            Reports
          </p>

          <h1 className="staff-page__title">
            Reports
          </h1>

          <p className="staff-page__subtitle">
            Analyze Pawmilya&apos;s animal welfare data and track key metrics.
          </p>
        </div>
      </div>

      <div className="reports__tabs">
        <button className="reports__tab reports__tab--active">
          <PawPrint size={12} />
          Animals
        </button>

        <button className="reports__tab">
          <Heart size={12} />
          Adoptions
        </button>

        <button className="reports__tab">
          <Search size={12} />
          Missing Pets
        </button>

        <button className="reports__tab">
          <Syringe size={12} />
          Vaccinations
        </button>
      </div>

      <section className="reports__stats">
        <ReportStat
          value={pets.length}
          label="Total Animals"
        />

        <ReportStat
          value={
            pets.filter(
              (pet) =>
                pet.status ===
                "Available"
            ).length
          }
          label="Available for Adoption"
        />

        <ReportStat
          value={
            applications.filter(
              (item) =>
                item.status ===
                "Pending"
            ).length
          }
          label="Pending Applications"
        />

        <ReportStat
          value={
            missingPets.filter(
              (pet) =>
                pet.status ===
                "Active"
            ).length
          }
          label="Missing Pet Reports"
        />
      </section>

      <section className="reports__grid">
        <div className="staff-card reports__chart-card">
          <h2>
            Animals by Status
          </h2>

          <div className="reports__donut">
            <div className="reports__donut-circle">
              <strong>
                {pets.length}
              </strong>

              <span>
                Total Animals
              </span>
            </div>

            <div className="reports__legend">
              <Legend
                label="Available for Adoption"
                value="34"
              />

              <Legend
                label="Under Treatment"
                value="28"
              />

              <Legend
                label="Pending Adoption"
                value="18"
              />

              <Legend
                label="Adopted"
                value="32"
              />

              <Legend
                label="Others"
                value="16"
              />
            </div>
          </div>
        </div>

        <div className="staff-card reports__chart-card">
          <h2>
            Animals by Type
          </h2>

          <Bar
            icon={<Dog size={12} />}
            label="Dog"
            value={56}
          />

          <Bar
            icon={<Cat size={12} />}
            label="Cat"
            value={42}
          />

          <Bar
            label="Rabbit"
            value={12}
          />

          <Bar
            label="Bird"
            value={8}
          />

          <Bar
            label="Others"
            value={10}
          />
        </div>

        <div className="staff-card reports__chart-card">
          <h2>
            Monthly Animal Intake vs. Adoptions
          </h2>

          <div className="reports__bars">
            {[20, 28, 19, 34, 45, 39, 52, 44, 41].map(
              (value, index) => (
                <div
                  className="reports__month"
                  key={index}
                >
                  <div>
                    <span
                      style={{
                        height: `${value}px`,
                      }}
                    />

                    <span
                      style={{
                        height: `${Math.max(
                          value - 10,
                          12
                        )}px`,
                      }}
                    />
                  </div>

                  <small>
                    {
                      [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                      ][index]
                    }
                  </small>
                </div>
              )
            )}
          </div>
        </div>

        <div className="staff-card reports__recent">
          <div className="reports__section-title">
            <h2>
              Recent Activity
            </h2>

            <button>
              View All
            </button>
          </div>

          <Activity
            date="Sep 26, 2026"
            animal="Bruno"
            type="Intake"
            details="Stray intake"
          />

          <Activity
            date="Sep 26, 2026"
            animal="Luna"
            type="Adoption"
            details="Adopted to a new family"
          />
        </div>
      </section>
    </div>
  );
}

function ReportStat({
  value,
  label,
}) {
  return (
    <div className="reports__stat">
      <strong>{value}</strong>
      <span>{label}</span>
      <span>›</span>
    </div>
  );
}

function Legend({
  label,
  value,
}) {
  return (
    <div className="reports__legend-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Bar({
  icon,
  label,
  value,
}) {
  return (
    <div className="reports__type-row">
      <span>
        {icon}
        {label}
      </span>

      <div>
        <span
          style={{
            width: `${value}%`,
          }}
        />
      </div>

      <strong>{value}</strong>
    </div>
  );
}

function Activity({
  date,
  animal,
  type,
  details,
}) {
  return (
    <div className="reports__activity">
      <span>{date}</span>

      <strong>{animal}</strong>

      <span>{type}</span>

      <span>{details}</span>
    </div>
  );
}

export default Reports;