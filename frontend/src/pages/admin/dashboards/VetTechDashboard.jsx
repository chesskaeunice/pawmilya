import {
  useMemo,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  PawPrint,
  Stethoscope,
  Syringe,
  FileText,
  MapPin,
} from "lucide-react";

import useAdminLists from "../../../hooks/useAdminLists.js";
import MyShifts from "../../../components/admin/MyShifts.jsx";

import "./VetTechDashboard.css";
import SafeImage from "../../../components/common/SafeImage.jsx";


const ATTENTION_STATUSES = [
  "Under Treatment",
  "Under Observation",
];

const ATTENTION_PRIORITY = {
  "Under Treatment": 0,
  "Under Observation": 1,
};


function VetTechDashboard() {
  const { vaccinations, animals } = useAdminLists();


  /* =========================================
     VACCINATION STATISTICS
  ========================================= */

  const vaccinationStats =
    useMemo(() => {
      return {
        overdue:
          vaccinations.filter(
            (record) =>
              getVaccinationStatus(record) === "Overdue"
          ).length,

        dueSoon:
          vaccinations.filter(
            (record) =>
              getVaccinationStatus(record) === "Due Soon"
          ).length,

        completed:
          vaccinations.filter(
            (record) =>
              getVaccinationStatus(record) === "Up to date"
          ).length,
      };
    }, [vaccinations]);


  /* =========================================
     VACCINATIONS NEEDING ACTION
     (overdue first, then soonest due)
  ========================================= */

  const dueVaccinations =
    useMemo(() => {
      return vaccinations
        .filter((record) =>
          [
            "Overdue",
            "Due Soon",
          ].includes(getVaccinationStatus(record))
        )
        .sort((a, b) => {

          const statusA = getVaccinationStatus(a);
          const statusB = getVaccinationStatus(b);

          if (statusA !== statusB) {
            return statusA === "Overdue"
              ? -1
              : 1;
          }

          return (
            getRecordDate(a, "nextDue") -
            getRecordDate(b, "nextDue")
          );
        })
        .slice(0, 4);
    }, [vaccinations]);


  /* =========================================
     RECENT VACCINATION ACTIVITY
  ========================================= */

  const recentVaccinations =
    useMemo(() => {
      return [...vaccinations]
        .sort(
          (a, b) =>
            getActivityDate(b) -
            getActivityDate(a)
        )
        .slice(0, 4);
    }, [vaccinations]);


  /* =========================================
     ANIMALS NEEDING HEALTH ATTENTION
  ========================================= */

  const attentionAnimals =
    useMemo(() => {
      return animals
        .filter((animal) =>
          ATTENTION_STATUSES.includes(
            animal.health_status
          )
        )
        .sort(
          (a, b) =>
            ATTENTION_PRIORITY[
              a.health_status
            ] -
            ATTENTION_PRIORITY[
              b.health_status
            ]
        );
    }, [animals]);


  const visibleAttentionAnimals =
    attentionAnimals.slice(
      0,
      4
    );


  return (
    <div className="staff-page vettech-dashboard">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="vettech-dashboard__header">

        <div>


          <h1 className="staff-page__title">
            Vet Tech Dashboard
          </h1>


          <p className="staff-page__subtitle">
            Track vaccination schedules,
            monitor animal health,
            and manage cases requiring
            medical attention.
          </p>

        </div>

      </div>


      {/* =====================================
          STAT CARDS
      ====================================== */}

      <section className="vettech-dashboard__stats">

        <StatCard
          icon={
            <AlertTriangle size={21} />
          }
          label="Overdue Vaccinations"
          value={
            vaccinationStats.overdue
          }
          description="Past their due date"
          variant="overdue"
          to="/admin/vaccinations"
        />


        <StatCard
          icon={
            <CalendarClock size={21} />
          }
          label="Due Soon"
          value={
            vaccinationStats.dueSoon
          }
          description="Upcoming vaccinations"
          variant="due-soon"
          to="/admin/vaccinations"
        />


        <StatCard
          icon={
            <CheckCircle2 size={21} />
          }
          label="Up to date"
          value={
            vaccinationStats.completed
          }
          description="Vaccinations administered"
          variant="completed"
          to="/admin/vaccinations"
        />


        <StatCard
          icon={
            <Stethoscope size={21} />
          }
          label="Health Attention"
          value={
            attentionAnimals.length
          }
          description="Checkup, treatment, or critical"
          variant="attention"
          to="/admin/animals"
        />

      </section>


      {/* =====================================
          MAIN WORKSPACE
      ====================================== */}

      <section className="vettech-dashboard__workspace">

        {/* ===================================
            LEFT
        ==================================== */}

        <div className="vettech-dashboard__column">

          {/* VACCINATIONS NEEDING ACTION */}

          <DashboardCard
            title="Vaccinations Needing Action"
            subtitle="Overdue and upcoming vaccinations to administer."
            actionText="View All Vaccinations"
            actionTo="/admin/vaccinations"
          >

            {dueVaccinations.length >
            0 ? (

              <div className="vettech-dashboard__vaccinations">

                {dueVaccinations.map(
                  (record) => (

                    <div
                      className="vettech-dashboard__vaccination"
                      key={record.id}
                    >

                      <div className="vettech-dashboard__vaccination-user">

                        <span className="vettech-dashboard__avatar">
                          {getInitials(
                            record.petName || record.animalName
                          )}
                        </span>


                        <div>

                          <strong>
                            {
                              record.petName || record.animalName
                            }
                          </strong>

                          <span>
                            Needs{" "}
                            <b>
                              {
                                record.vaccine
                              }
                            </b>
                          </span>

                        </div>

                      </div>


                      <div
                        className={`vettech-dashboard__date ${
                          getVaccinationStatus(record) === "Overdue"
                            ? "vettech-dashboard__date--overdue"
                            : ""
                        }`}
                      >

                        <Clock3 size={14} />

                        {getDueLabel(
                          record.nextDue
                        )}

                      </div>


                      <StatusBadge
                        status={
                          getVaccinationStatus(record)
                        }
                      />


                      <Link
                        to="/admin/vaccinations"
                        className="vettech-dashboard__record"
                      >
                        Record

                        <ArrowRight size={14} />
                      </Link>

                    </div>

                  )
                )}

              </div>

            ) : (

              <EmptyState
                title="All vaccinations up to date"
                description="There are currently no overdue or upcoming vaccinations."
              />

            )}

          </DashboardCard>


          {/* RECENT ACTIVITY */}

          <DashboardCard
            title="Recent Vaccination Activity"
            subtitle="Latest vaccination records and their current status."
            actionText="View Vaccinations"
            actionTo="/admin/vaccinations"
          >

            {recentVaccinations.length >
            0 ? (

              <div className="vettech-dashboard__activity-list">

                {recentVaccinations.map(
                  (record) => (

                    <Link
                      to="/admin/vaccinations"
                      className="vettech-dashboard__activity"
                      key={record.id}
                    >

                      <span
                        className={`vettech-dashboard__activity-icon vettech-dashboard__activity-icon--${toSlug(
                          getVaccinationStatus(record)
                        )}`}
                      >

                        {getVaccinationStatus(record) === "Up to date" ? (

                          <CheckCircle2 size={18} />

                        ) : getVaccinationStatus(record) === "Overdue" ? (

                          <AlertTriangle size={18} />

                        ) : (

                          <Clock3 size={18} />

                        )}

                      </span>


                      <div className="vettech-dashboard__activity-info">

                        <strong>
                          {
                            record.petName || record.animalName
                          }
                        </strong>

                        <span>
                          <b>
                            {
                              record.vaccine
                            }
                          </b>
                          {" vaccination"}
                        </span>

                      </div>


                      <div className="vettech-dashboard__activity-meta">

                        <StatusBadge
                          status={
                            getVaccinationStatus(record)
                          }
                        />

                        <span>
                          {formatTimestamp(
                            record.date ||
                            record.nextDue
                          )}
                        </span>

                      </div>

                    </Link>

                  )
                )}

              </div>

            ) : (

              <EmptyState
                title="No vaccination records"
                description="Vaccination activity will appear here once records are added."
              />

            )}

          </DashboardCard>

        </div>


        {/* ===================================
            RIGHT
        ==================================== */}

        <div className="vettech-dashboard__column">

          <DashboardCard
            title="Animals Needing Health Attention"
            subtitle="Animals flagged for checkup, treatment, or critical care."
            actionText="View All Animals"
            actionTo="/admin/animals"
          >

            {visibleAttentionAnimals.length >
            0 ? (

              <div className="vettech-dashboard__attention-list">

                {visibleAttentionAnimals.map(
                  (animal) => {

                    const image =
                      animal.images?.[0] ||
                      animal.image;


                    return (
                      <Link
                        to={`/admin/animals/${animal.id}`}
                        className="vettech-dashboard__attention"
                        key={animal.id}
                      >

                        <div className="vettech-dashboard__attention-photo">

                          {image ? (

                            <SafeImage
                              src={image}
                              alt={animal.name}
                            />

                          ) : (

                            <PawPrint size={21} />

                          )}

                        </div>


                        <div className="vettech-dashboard__attention-info">

                          <div className="vettech-dashboard__attention-title">

                            <strong>
                              {animal.name}
                            </strong>


                            <HealthStatus
                              status={
                                animal.health_status
                              }
                            />

                          </div>


                          <span>
                            {animal.type}
                            {" · "}
                            {animal.breed}
                          </span>


                          {animal.location && (
                            <p>
                              <MapPin size={14} />

                              {animal.location}
                            </p>
                          )}


                          <small>
                            Updated{" "}
                            {formatTimestamp(
                              animal.updatedAt
                            )}
                          </small>

                        </div>

                      </Link>
                    );
                  }
                )}

              </div>

            ) : (

              <EmptyState
                title="No animals need attention"
                description="All animals are currently marked as healthy."
              />

            )}

          </DashboardCard>

        </div>

      </section>


      {/* =====================================
          QUICK ACTIONS
      ====================================== */}

      <section className="vettech-dashboard__quick">

        <div className="vettech-dashboard__quick-header">

          <div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Go directly to the vet tech's
              primary work areas.
            </p>

          </div>

        </div>


        <div className="vettech-dashboard__quick-grid">

          <Link
            to="/admin/vaccinations"
            className="vettech-dashboard__quick-action"
          >

            <span className="vettech-dashboard__quick-icon">
              <Syringe size={21} />
            </span>


            <div>

              <strong>
                Vaccinations
              </strong>

              <span>
                Record and manage animal
                vaccinations.
              </span>

            </div>


            <ArrowRight size={19} />

          </Link>


          <Link
            to="/admin/animals"
            className="vettech-dashboard__quick-action"
          >

            <span className="vettech-dashboard__quick-icon">
              <PawPrint size={21} />
            </span>


            <div>

              <strong>
                Animals
              </strong>

              <span>
                View animals and update
                health records.
              </span>

            </div>


            <ArrowRight size={19} />

          </Link>


          <Link
            to="/admin/reports"
            className="vettech-dashboard__quick-action"
          >

            <span className="vettech-dashboard__quick-icon">
              <FileText size={21} />
            </span>


            <div>

              <strong>
                Health Reports
              </strong>

              <span>
                Review health and
                vaccination reports.
              </span>

            </div>


            <ArrowRight size={19} />

          </Link>

        </div>

      </section>


      <MyShifts />

    </div>
  );
}


/* =========================================
   STAT CARD
========================================= */

function StatCard({
  icon,
  label,
  value,
  description,
  variant,
  to,
}) {
  return (
    <Link
      to={to}
      className={`vettech-dashboard__stat vettech-dashboard__stat--${variant}`}
    >

      <span className="vettech-dashboard__stat-icon">
        {icon}
      </span>


      <div>

        <span className="vettech-dashboard__stat-label">
          {label}
        </span>


        <strong>
          {value}
        </strong>


        <small>
          {description}
        </small>

      </div>

    </Link>
  );
}


/* =========================================
   CARD
========================================= */

function DashboardCard({
  title,
  subtitle,
  actionText,
  actionTo,
  children,
}) {
  return (
    <section className="vettech-dashboard__card">

      <div className="vettech-dashboard__card-header">

        <div>

          <h2>
            {title}
          </h2>

          <p>
            {subtitle}
          </p>

        </div>


        <Link to={actionTo}>
          {actionText}

          <ArrowRight size={15} />
        </Link>

      </div>


      {children}

    </section>
  );
}


/* =========================================
   STATUS
========================================= */

function StatusBadge({
  status,
}) {
  return (
    <span
      className={`vettech-dashboard__status vettech-dashboard__status--${toSlug(
        status
      )}`}
    >
      {status}
    </span>
  );
}


function HealthStatus({
  status,
}) {
  return (
    <span
      className={`vettech-dashboard__health-status vettech-dashboard__health-status--${toSlug(
        status
      )}`}
    >
      {status}
    </span>
  );
}


/* =========================================
   EMPTY
========================================= */

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="vettech-dashboard__empty">

      <PawPrint size={26} />

      <strong>
        {title}
      </strong>

      <p>
        {description}
      </p>

    </div>
  );
}


/* =========================================
   HELPERS
========================================= */

function toSlug(value = "") {
  return value
    .toLowerCase()
    .replaceAll(" ", "-");
}


function getInitials(name) {
  if (!name) {
    return "?";
  }


  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (word) =>
        word.charAt(0)
    )
    .join("")
    .toUpperCase();
}


function getRecordDate(
  record,
  field
) {
  const date =
    new Date(
      record[field]
    );


  return Number.isNaN(
    date.getTime()
  )
    ? record.id
    : date.getTime();
}


function getActivityDate(record) {
  const date =
    new Date(
      record.date ||
        record.nextDue
    );


  return Number.isNaN(
    date.getTime()
  )
    ? record.id
    : date.getTime();
}

function getVaccinationStatus(record) {
  const dueDate = parseDate(record.nextDue);

  if (!dueDate) {
    return "Up to date";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const days = Math.round(
    (dueDate - today) / 86400000
  );

  if (days < 0) {
    return "Overdue";
  }

  return days <= 30 ? "Due Soon" : "Up to date";
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDueLabel(value) {
  if (!value) {
    return "No due date";
  }

  const due = parseDate(value);
  if (!due) {
    return value;
  }


  const today =
    new Date();

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);


  const days =
    Math.round(
      (due - today) /
        86400000
    );


  if (days === 0) {
    return "Due today";
  }


  if (days > 0) {
    return `Due in ${days} day${
      days === 1 ? "" : "s"
    }`;
  }


  const late =
    Math.abs(days);

  return `${late} day${
    late === 1 ? "" : "s"
  } overdue`;
}


function formatTimestamp(value) {
  if (!value) {
    return "Date unavailable";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Date unavailable";
  }


  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}


export default VetTechDashboard;