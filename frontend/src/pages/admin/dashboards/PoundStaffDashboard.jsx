import {
  useMemo,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  ClipboardList,
  Home,
  MapPin,
  PawPrint,
  Search,
  NotebookPen,
} from "lucide-react";

import animals from "../../../data/pets.js";
import missingPets from "../../../data/missingPets.js";

import "./PoundStaffDashboard.css";


/* =========================================
   FIELD ACCESSORS
   Adjust these if your animals.js uses
   different property names.
========================================= */

const getAnimalImage = (animal) =>
  animal.image ||
  animal.photo ||
  animal.petImages?.[0] ||
  null;

const getAnimalSpecies = (animal) =>
  animal.species ||
  animal.type ||
  "Animal";

const getAnimalLocation = (animal) =>
  animal.kennel ||
  animal.shelterLocation ||
  animal.location ||
  "";

const getAnimalNotes = (animal) =>
  animal.temperament ||
  animal.behaviorNotes ||
  animal.personality ||
  "";

const getAnimalStatus = (animal) =>
  animal.status ||
  "In Care";


function PoundStaffDashboard() {

  /* =========================================
     ANIMAL STATISTICS
  ========================================= */

  const animalStats =
    useMemo(() => {
      return {
        total:
          animals.length,

        noKennel:
          animals.filter(
            (animal) =>
              !getAnimalLocation(animal)
          ).length,

        noNotes:
          animals.filter(
            (animal) =>
              !getAnimalNotes(animal)
          ).length,
      };
    }, []);


  /* =========================================
     DAILY TASKS
     Animals missing a kennel location or
     behavior notes
  ========================================= */

  const dailyTasks =
    useMemo(() => {
      return animals
        .map((animal) => {
          const tasks = [];

          if (!getAnimalLocation(animal)) {
            tasks.push("kennel");
          }

          if (!getAnimalNotes(animal)) {
            tasks.push("behavior");
          }

          return {
            animal,
            tasks,
          };
        })
        .filter(
          (item) =>
            item.tasks.length > 0
        )
        .slice(0, 4);
    }, []);


  /* =========================================
     RECENTLY ADDED ANIMALS
  ========================================= */

  const recentAnimals =
    useMemo(() => {
      return [...animals]
        .sort(
          (a, b) =>
            getAnimalDate(b) -
            getAnimalDate(a)
        )
        .slice(0, 4);
    }, []);


  /* =========================================
     MISSING PETS (VIEW ONLY)
  ========================================= */

  const activeMissingReports =
    useMemo(() => {
      return missingPets
        .filter((pet) =>
          [
            "Lost",
            "Sighted",
            "Found",
          ].includes(pet.status)
        )
        .sort(
          (a, b) =>
            new Date(b.reportedAt) -
            new Date(a.reportedAt)
        );
    }, []);


  const visibleMissingReports =
    activeMissingReports.slice(
      0,
      4
    );


  return (
    <div className="staff-page pound-dashboard">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="pound-dashboard__header">

        <div>



          <h1 className="staff-page__title">
            Pound Staff Dashboard
          </h1>


          <p className="staff-page__subtitle">
            Your daily overview of animals in
            care, kennel assignments, behavior
            logs, and missing pet reports.
          </p>

        </div>

      </div>


      {/* =====================================
          STAT CARDS
      ====================================== */}

      <section className="pound-dashboard__stats">

        <StatCard
          icon={
            <PawPrint size={21} />
          }
          label="Animals in Care"
          value={animalStats.total}
          description="Total animal records"
          variant="animals"
          to="/admin/animals"
        />


        <StatCard
          icon={
            <Home size={21} />
          }
          label="Needs Kennel Location"
          value={animalStats.noKennel}
          description="No kennel assigned"
          variant="kennel"
          to="/admin/animals"
        />


        <StatCard
          icon={
            <NotebookPen size={21} />
          }
          label="Needs Behavior Notes"
          value={animalStats.noNotes}
          description="No daily behavior logged"
          variant="behavior"
          to="/admin/animals"
        />


        <StatCard
          icon={
            <Search size={21} />
          }
          label="Active Missing Reports"
          value={
            activeMissingReports.length
          }
          description="Lost, sighted, or found"
          variant="missing"
          to="/admin/missing-pets"
        />

      </section>


      {/* =====================================
          MAIN WORKSPACE
      ====================================== */}

      <section className="pound-dashboard__workspace">

        {/* ===================================
            LEFT
        ==================================== */}

        <div className="pound-dashboard__column">

          {/* DAILY TASKS */}

          <DashboardCard
            title="Today's Care Tasks"
            subtitle="Animals needing a kennel update or a behavior log."
            actionText="View All Animals"
            actionTo="/admin/animals"
          >

            {dailyTasks.length > 0 ? (

              <div className="pound-dashboard__tasks">

                {dailyTasks.map(
                  ({ animal, tasks }) => {

                    const image =
                      getAnimalImage(animal);


                    return (
                      <div
                        className="pound-dashboard__task"
                        key={animal.id}
                      >

                        <div className="pound-dashboard__task-animal">

                          <span className="pound-dashboard__thumb">

                            {image ? (

                              <img
                                src={image}
                                alt={animal.name}
                              />

                            ) : (

                              <PawPrint size={18} />

                            )}

                          </span>


                          <div>

                            <strong>
                              {animal.name}
                            </strong>

                            <span>
                              {getAnimalSpecies(animal)}
                              {animal.breed
                                ? ` · ${animal.breed}`
                                : ""}
                            </span>

                          </div>

                        </div>


                        <div className="pound-dashboard__task-tags">

                          {tasks.includes("kennel") && (
                            <span className="pound-dashboard__tag pound-dashboard__tag--kennel">
                              <Home size={12} />
                              Assign kennel
                            </span>
                          )}

                          {tasks.includes("behavior") && (
                            <span className="pound-dashboard__tag pound-dashboard__tag--behavior">
                              <NotebookPen size={12} />
                              Log behavior
                            </span>
                          )}

                        </div>


                        <Link
                          to={`/admin/animals/${animal.id}`}
                          className="pound-dashboard__review"
                        >
                          Update

                          <ArrowRight size={14} />
                        </Link>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <EmptyState
                title="All caught up"
                description="Every animal has a kennel location and behavior notes."
              />

            )}

          </DashboardCard>


          {/* RECENT ANIMALS */}

          <DashboardCard
            title="Recently Added Animals"
            subtitle="Latest animal records in the shelter."
            actionText="View Animals"
            actionTo="/admin/animals"
          >

            {recentAnimals.length > 0 ? (

              <div className="pound-dashboard__animal-list">

                {recentAnimals.map(
                  (animal) => {

                    const image =
                      getAnimalImage(animal);

                    const location =
                      getAnimalLocation(animal);


                    return (
                      <Link
                        to={`/admin/animals/${animal.id}`}
                        className="pound-dashboard__animal"
                        key={animal.id}
                      >

                        <span className="pound-dashboard__thumb">

                          {image ? (

                            <img
                              src={image}
                              alt={animal.name}
                            />

                          ) : (

                            <PawPrint size={18} />

                          )}

                        </span>


                        <div className="pound-dashboard__animal-info">

                          <strong>
                            {animal.name}
                          </strong>

                          <span>
                            {getAnimalSpecies(animal)}
                            {animal.breed
                              ? ` · ${animal.breed}`
                              : ""}
                          </span>

                        </div>


                        <div className="pound-dashboard__animal-meta">

                          <StatusBadge
                            status={
                              getAnimalStatus(animal)
                            }
                          />

                          <span>
                            {location ||
                              "No kennel"}
                          </span>

                        </div>

                      </Link>
                    );
                  }
                )}

              </div>

            ) : (

              <EmptyState
                title="No animals yet"
                description="Animal records will appear here once they are added."
              />

            )}

          </DashboardCard>

        </div>


        {/* ===================================
            RIGHT
        ==================================== */}

        <div className="pound-dashboard__column">

          <DashboardCard
            title="Missing Pet Reports"
            subtitle="Recent reports you can view for reference."
            actionText="View All Reports"
            actionTo="/admin/missing-pets"
          >

            {visibleMissingReports.length >
            0 ? (

              <div className="pound-dashboard__missing-list">

                {visibleMissingReports.map(
                  (pet) => {

                    const image =
                      pet.petImages?.[0] ||
                      pet.image;


                    return (
                      <Link
                        to={`/admin/missing-pets/${pet.id}`}
                        className="pound-dashboard__missing"
                        key={pet.id}
                      >

                        <div className="pound-dashboard__missing-photo">

                          {image ? (

                            <img
                              src={image}
                              alt={pet.name}
                            />

                          ) : (

                            <PawPrint size={21} />

                          )}

                        </div>


                        <div className="pound-dashboard__missing-info">

                          <div className="pound-dashboard__missing-title">

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
                description="There are currently no active missing pet reports."
              />

            )}

          </DashboardCard>

        </div>

      </section>


      {/* =====================================
          QUICK ACTIONS
      ====================================== */}

      <section className="pound-dashboard__quick">

        <div className="pound-dashboard__quick-header">

          <div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Jump to your everyday work areas.
            </p>

          </div>

        </div>


        <div className="pound-dashboard__quick-grid">

          <Link
            to="/admin/animals"
            className="pound-dashboard__quick-action"
          >

            <span className="pound-dashboard__quick-icon">
              <ClipboardList size={21} />
            </span>


            <div>

              <strong>
                Animals
              </strong>

              <span>
                View profiles, update kennel
                locations, and log daily behavior.
              </span>

            </div>


            <ArrowRight size={19} />

          </Link>


          <Link
            to="/admin/missing-pets"
            className="pound-dashboard__quick-action"
          >

            <span className="pound-dashboard__quick-icon">
              <Search size={21} />
            </span>


            <div>

              <strong>
                Missing Pet Reports
              </strong>

              <span>
                View missing, sighted, and found
                pet reports.
              </span>

            </div>


            <ArrowRight size={19} />

          </Link>

        </div>

      </section>

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
      className={`pound-dashboard__stat pound-dashboard__stat--${variant}`}
    >

      <span className="pound-dashboard__stat-icon">
        {icon}
      </span>


      <div>

        <span className="pound-dashboard__stat-label">
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
    <section className="pound-dashboard__card">

      <div className="pound-dashboard__card-header">

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
      className={`pound-dashboard__status pound-dashboard__status--${String(status)
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      {status}
    </span>
  );
}


function MissingStatus({
  status,
}) {
  return (
    <span
      className={`pound-dashboard__missing-status pound-dashboard__missing-status--${String(status)
        .toLowerCase()
        .replaceAll(" ", "-")}`}
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
    <div className="pound-dashboard__empty">

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

function getAnimalDate(animal) {
  const date =
    new Date(
      animal.intakeDate ||
      animal.createdAt ||
      animal.dateAdded
    );


  return Number.isNaN(
    date.getTime()
  )
    ? Number(animal.id) || 0
    : date.getTime();
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

export default PoundStaffDashboard;