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
  ClipboardList,
  Clock3,
  MapPin,
  PawPrint,
  Search,
  Syringe,
  XCircle,
} from "lucide-react";

import useAdminLists from "../../../hooks/useAdminLists.js";
import OnDutyToday from "../../../components/admin/OnDutyToday.jsx";

import "./KennelManagerDashboard.css";


const ACTIVE_MISSING_STATUSES = [
  "Lost",
  "Sighted",
  "Found",
];

const ATTENTION_STATUSES = [
  "Under Treatment",
  "Under Observation",
];


function KennelManagerDashboard() {
  const { animals, applications, missingPets, vaccinations } = useAdminLists();


  /* =========================================
     OVERVIEW STATISTICS
  ========================================= */

  const stats =
    useMemo(() => {
      return {
        animals:
          animals.length,

        available:
          animals.filter(
            (animal) =>
              animal.status === "Available for Adoption"
          ).length,

        healthAttention:
          animals.filter(
            (animal) =>
              ATTENTION_STATUSES.includes(
                animal.health_status
              )
          ).length,

        pendingApplications:
          applications.filter(
            (application) =>
              application.status === "Pending"
          ).length,

        approvedApplications:
          applications.filter(
            (application) =>
              application.status === "Approved"
          ).length,

        activeMissing:
          missingPets.filter(
            (pet) =>
              ACTIVE_MISSING_STATUSES.includes(
                pet.status
              )
          ).length,

        reunited:
          missingPets.filter(
            (pet) =>
              pet.status === "Reunited"
          ).length,

        overdueVaccinations:
          vaccinations.filter(
            (record) =>
              getVaccinationStatus(record) === "Overdue"
          ).length,

        dueSoonVaccinations:
          vaccinations.filter(
            (record) =>
              getVaccinationStatus(record) === "Due Soon"
          ).length,
      };
    }, [animals, applications, missingPets, vaccinations]);


  /* =========================================
     PENDING APPLICATIONS
  ========================================= */

  const pendingApplications =
    useMemo(() => {
      return applications
        .filter(
          (application) =>
            application.status === "Pending"
        )
        .sort(
          (a, b) =>
            getTime(b.date, b.id) -
            getTime(a.date, a.id)
        )
        .slice(0, 4);
    }, [applications]);


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
            getTime(a.nextDue, a.id) -
            getTime(b.nextDue, b.id)
          );
        })
        .slice(0, 4);
    }, [vaccinations]);


  /* =========================================
     ANIMAL OVERVIEW
  ========================================= */

  const animalsByType =
    useMemo(() => {
      return countBy(
        animals,
        (animal) => animal.type || "Other"
      );
    }, [animals]);


  const animalsByStatus =
    useMemo(() => {
      return countBy(
        animals,
        (animal) => animal.status || "Unknown"
      );
    }, [animals]);


  /* =========================================
     MISSING PETS NEEDING ATTENTION
  ========================================= */

  const visibleMissingReports =
    useMemo(() => {
      return missingPets
        .filter((pet) =>
          ACTIVE_MISSING_STATUSES.includes(
            pet.status
          )
        )
        .sort(
          (a, b) =>
            getTime(b.reportedAt, b.id) -
            getTime(a.reportedAt, a.id)
        )
        .slice(0, 3);
    }, [missingPets]);


  return (
    <div className="staff-page manager-dashboard">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="manager-dashboard__header">

        <div>

          <h1 className="staff-page__title">
            Kennel Manager Dashboard
          </h1>


          <p className="staff-page__subtitle">
            Oversee animals, adoptions,
            missing pet reports, and
            vaccinations across the
            whole shelter.
          </p>

        </div>

      </div>


      {/* =====================================
          STAT CARDS
      ====================================== */}

      <section className="manager-dashboard__stats">

        <StatCard
          icon={
            <PawPrint size={21} />
          }
          label="Animals in Care"
          value={
            stats.animals
          }
          description={`${stats.available} available for adoption`}
          variant="animals"
          to="/admin/animals"
        />


        <StatCard
          icon={
            <ClipboardList size={21} />
          }
          label="Pending Applications"
          value={
            stats.pendingApplications
          }
          description={`${stats.approvedApplications} approved so far`}
          variant="applications"
          to="/admin/adoption-applications"
        />


        <StatCard
          icon={
            <Search size={21} />
          }
          label="Active Missing Reports"
          value={
            stats.activeMissing
          }
          description={`${stats.reunited} reunited with owners`}
          variant="missing"
          to="/admin/missing-pets"
        />


        <StatCard
          icon={
            <Syringe size={21} />
          }
          label="Vaccinations Due"
          value={
            stats.overdueVaccinations +
            stats.dueSoonVaccinations
          }
          description={`${stats.overdueVaccinations} overdue`}
          variant="vaccinations"
          to="/admin/vaccinations"
        />

      </section>


      {/* =====================================
          MAIN WORKSPACE
      ====================================== */}

      <section className="manager-dashboard__workspace">

          {/* PENDING APPLICATIONS */}

          <DashboardCard
            title="Awaiting Decision"
            subtitle="Adoption applications waiting for a final decision."
            actionText="View All Applications"
            actionTo="/admin/adoption-applications"
          >

            {pendingApplications.length >
            0 ? (

              <div className="manager-dashboard__rows">

                {pendingApplications.map(
                  (application) => (

                    <div
                      className="manager-dashboard__row"
                      key={application.id}
                    >

                      <div className="manager-dashboard__row-user">

                        <span className="manager-dashboard__avatar">
                          {getInitials(
                            application.applicantName
                          )}
                        </span>


                        <div>

                          <strong>
                            {
                              application.applicantName
                            }
                          </strong>

                          <span>
                            Applying for{" "}
                            <b>
                              {
                                application.petName
                              }
                            </b>
                          </span>

                          <small className="manager-dashboard__date">
                            <Clock3 size={12} />

                            {
                              application.date
                            }
                          </small>

                        </div>

                      </div>


                      <StatusBadge
                        status={
                          application.status
                        }
                      />


                      <Link
                        to={`/admin/adoption-applications/${application.id}`}
                        className="manager-dashboard__row-action"
                      >
                        Review

                        <ArrowRight size={14} />
                      </Link>

                    </div>

                  )
                )}

              </div>

            ) : (

              <EmptyState
                title="No applications waiting"
                description="There are currently no pending adoption applications."
              />

            )}

          </DashboardCard>


          {/* ANIMAL OVERVIEW */}

          <DashboardCard
            title="Shelter Population"
            subtitle="Current shelter population by type and status."
            actionText="View All Animals"
            actionTo="/admin/animals"
          >

            {animals.length >
            0 ? (

              <div className="manager-dashboard__overview">

                <BreakdownGroup
                  title="By Type"
                  items={animalsByType}
                  total={animals.length}
                />


                <BreakdownGroup
                  title="By Status"
                  items={animalsByStatus}
                  total={animals.length}
                />


                <div
                  className={`manager-dashboard__health-note ${
                    stats.healthAttention > 0
                      ? "manager-dashboard__health-note--alert"
                      : ""
                  }`}
                >

                  {stats.healthAttention > 0 ? (

                    <AlertTriangle size={16} />

                  ) : (

                    <CheckCircle2 size={16} />

                  )}

                  <span>
                    {stats.healthAttention > 0
                      ? `${stats.healthAttention} animal${
                          stats.healthAttention === 1 ? "" : "s"
                        } flagged for health attention`
                      : "No animals flagged for health attention"}
                  </span>

                </div>

              </div>

            ) : (

              <EmptyState
                title="No animals recorded"
                description="Animals will appear here once they are added."
              />

            )}

          </DashboardCard>


          {/* VACCINATIONS NEEDING ACTION */}

          <DashboardCard
            title="Needs Action"
            subtitle="Overdue and upcoming vaccinations to follow up."
            actionText="View All Vaccinations"
            actionTo="/admin/vaccinations"
          >

            {dueVaccinations.length >
            0 ? (

              <div className="manager-dashboard__rows">

                {dueVaccinations.map(
                  (record) => (

                    <div
                      className="manager-dashboard__row"
                      key={record.id}
                    >

                      <div className="manager-dashboard__row-user">

                        <span className="manager-dashboard__avatar">
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

                          <small
                            className={`manager-dashboard__date ${
                              getVaccinationStatus(record) === "Overdue"
                                ? "manager-dashboard__date--overdue"
                                : ""
                            }`}
                          >
                            <Clock3 size={12} />

                            {getDueLabel(
                              record.nextDue
                            )}
                          </small>

                        </div>

                      </div>


                      <StatusBadge
                        status={
                          getVaccinationStatus(record)
                        }
                      />


                      <Link
                        to="/admin/vaccinations"
                        className="manager-dashboard__row-action"
                      >
                        View

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


          {/* MISSING PETS */}

          <DashboardCard
            title="Open Cases"
            subtitle="Latest lost, sighted, and found pet reports."
            actionText="View All Reports"
            actionTo="/admin/missing-pets"
          >

            {visibleMissingReports.length >
            0 ? (

              <div className="manager-dashboard__missing-list">

                {visibleMissingReports.map(
                  (pet) => {

                    const image =
                      pet.petImages?.[0] ||
                      pet.image;


                    return (
                      <Link
                        to={`/admin/missing-pets/${pet.id}`}
                        className="manager-dashboard__missing"
                        key={pet.id}
                      >

                        <div className="manager-dashboard__missing-photo">

                          {image ? (

                            <img
                              src={image}
                              alt={pet.name}
                            />

                          ) : (

                            <PawPrint size={21} />

                          )}

                        </div>


                        <div className="manager-dashboard__missing-info">

                          <div className="manager-dashboard__missing-title">

                            <strong>
                              {pet.name}
                            </strong>


                            <MissingStatus
                              status={
                                pet.status
                              }
                            />

                          </div>


                          <span>
                            {pet.type}
                            {" · "}
                            {pet.breed}
                          </span>


                          <p>
                            <MapPin size={14} />

                            {pet.location}
                          </p>


                          <small>
                            Reported{" "}
                            {formatTimestamp(
                              pet.reportedAt
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
                title="No active missing reports"
                description="There are currently no missing pet cases requiring attention."
              />

            )}

          </DashboardCard>

      </section>


      <OnDutyToday />

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
      className={`manager-dashboard__stat manager-dashboard__stat--${variant}`}
    >

      <span className="manager-dashboard__stat-icon">
        {icon}
      </span>


      <div>

        <span className="manager-dashboard__stat-label">
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
    <section className="manager-dashboard__card">

      <div className="manager-dashboard__card-header">

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
   ANIMAL BREAKDOWN
========================================= */

function BreakdownGroup({
  title,
  items,
  total,
}) {
  return (
    <div className="manager-dashboard__breakdown">

      <h3>
        {title}
      </h3>


      {items.map(
        ([label, count]) => (

          <div
            className="manager-dashboard__breakdown-row"
            key={label}
          >

            <div className="manager-dashboard__breakdown-label">

              <span>
                {label}
              </span>

              <strong>
                {count}
              </strong>

            </div>


            <div className="manager-dashboard__bar">

              <span
                style={{
                  width: `${
                    total > 0
                      ? (count / total) * 100
                      : 0
                  }%`,
                }}
              />

            </div>

          </div>

        )
      )}

    </div>
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
      className={`manager-dashboard__status manager-dashboard__status--${toSlug(
        status
      )}`}
    >

      {status === "Pending" ? (

        <Clock3 size={11} />

      ) : status === "Overdue" ? (

        <AlertTriangle size={11} />

      ) : status === "Due Soon" ? (

        <CalendarClock size={11} />

      ) : status === "Rejected" ? (

        <XCircle size={11} />

      ) : (

        <CheckCircle2 size={11} />

      )}

      {status}
    </span>
  );
}


function MissingStatus({
  status,
}) {
  return (
    <span
      className={`manager-dashboard__missing-status manager-dashboard__missing-status--${toSlug(
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
    <div className="manager-dashboard__empty">

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


function countBy(list, getKey) {
  const counts =
    list.reduce(
      (result, item) => {
        const key =
          getKey(item);

        result[key] =
          (result[key] || 0) + 1;

        return result;
      },
      {}
    );


  return Object.entries(counts)
    .sort(
      (a, b) =>
        b[1] - a[1]
    );
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


function getTime(
  value,
  fallback = 0
) {
  const date =
    parseDate(value);


  return date
    ? date.getTime()
    : fallback;
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


function getDaysUntil(value) {
  const due =
    parseDate(value);

  if (!due) {
    return null;
  }


  const today =
    new Date();

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);


  return Math.round(
    (due - today) /
      86400000
  );
}


function getVaccinationStatus(record) {
  const days =
    getDaysUntil(record.nextDue);

  if (days === null) {
    return "Up to date";
  }

  if (days < 0) {
    return "Overdue";
  }

  return days <= 30 ? "Due Soon" : "Up to date";
}


function getDueLabel(value) {
  if (!value) {
    return "No due date";
  }


  const days =
    getDaysUntil(value);

  if (days === null) {
    return value;
  }


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
  const date =
    parseDate(value);


  if (!date) {
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


export default KennelManagerDashboard;
