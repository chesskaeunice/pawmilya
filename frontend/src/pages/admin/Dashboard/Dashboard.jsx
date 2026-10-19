import {
  ChevronRight,
} from "lucide-react";

import AdminStatCard from "../../../components/admin/AdminStatCard.jsx";

import pets from "../../../data/pets.js";
import applications from "../../../data/applications.js";
import missingPets from "../../../data/missingPets.js";

import "./Dashboard.css";


function Dashboard() {
  return (
    <div className="staff-page">

      <div className="staff-page__top">

        <div>
          <h1 className="staff-page__title">
            Good Morning, Staff!
          </h1>

          <p className="staff-page__subtitle">
            Here&apos;s an overview of Pawmilya&apos;s animal welfare activities.
          </p>
        </div>

        <div className="staff-page__date">
          September 30, 2026
          <br />
          Monday, 9:41 AM
        </div>

      </div>


      <section className="dashboard__stats">

        <AdminStatCard
          value="128"
          label="Total Animals"
        />

        <AdminStatCard
          value="34"
          label="Available for Adoption"
        />

        <AdminStatCard
          value="12"
          label="Pending Applications"
        />

        <AdminStatCard
          value="12"
          label="Missing Pet Reports"
        />

      </section>


      <section className="dashboard__main-grid">

        <div className="staff-card dashboard__records">

          <div className="dashboard__section-heading">
            <h2>
              Recent Animal Records
            </h2>

            <button type="button">
              View All
            </button>
          </div>


          {pets.slice(0, 6).map((pet) => (

            <div
              className="dashboard__record-row"
              key={pet.id}
            >

              <span>
                A-{String(pet.id).padStart(3, "0")}
              </span>

              <div className="dashboard__record-photo" />

              <strong>
                {pet.name}
              </strong>

              <span>
                {pet.type}
              </span>

              <span className="staff-status staff-status--available">
                {pet.status}
              </span>

              <span>
                Sep 26, 2026
              </span>

              <ChevronRight size={13} />

            </div>

          ))}

        </div>


        <div className="dashboard__side">

          <div className="staff-card dashboard__applications">

            <div className="dashboard__section-heading">
              <h2>
                Adoption Applications
              </h2>

              <button type="button">
                View All
              </button>
            </div>


            {applications.map((application) => (

              <div
                className="dashboard__application-row"
                key={application.id}
              >

                <div>
                  <strong>
                    Maria Santos
                  </strong>

                  <span>
                    {application.petName}
                  </span>
                </div>


                <span>
                  Sep 27, 2026
                </span>


                <span className="staff-status staff-status--pending">
                  {application.status}
                </span>

              </div>

            ))}

          </div>


          <div className="staff-card dashboard__missing">

            <div className="dashboard__section-heading">
              <h2>
                Missing Pet Reports
              </h2>
            </div>


            {missingPets.slice(0, 3).map((pet) => (

              <div
                className="dashboard__missing-row"
                key={pet.id}
              >
                <div className="dashboard__mini-photo" />

                <div>
                  <strong>
                    {pet.name}
                  </strong>

                  <span>
                    {pet.location}
                  </span>
                </div>

                <span className="staff-status staff-status--current">
                  Reunited
                </span>
              </div>

            ))}

          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;