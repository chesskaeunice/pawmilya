import { useRef, useState } from "react";

import SearchBar from "../../../components/common/SearchBar.jsx";
import Pagination from "../../../components/common/Pagination.jsx";
import PetPreviewCard from "../../../components/landing/PetPreviewCard.jsx";

import useDebouncedValue from "../../../hooks/useDebouncedValue.js";
import useFetch from "../../../hooks/useFetch.js";
import { listPets } from "../../../services/animalService.js";

import adoptablePetsHero from "../../../assets/images/users/home/adoptablePets-hero.jpg";

import "./AdoptablePets.css";
import BackButton from "../../../components/common/BackButton.jsx";

const PETS_PER_PAGE = 6;

function AdoptablePets() {
  const listRef = useRef(null);

  // live search: the grid filters on every keystroke
  const [query, setQuery] = useState("");
  // Filters are sent to the API (only animals available for adoption come back)
  const [type, setType] = useState("All");
  const [sex, setSex] = useState("All");
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebouncedValue(query);

  const { data, loading } = useFetch(
    () =>
      listPets({
        q: debouncedQuery || undefined,
        type: type === "All" ? undefined : type,
        sex: sex === "All" ? undefined : sex,
        per_page: PETS_PER_PAGE,
        page,
      }),
    [debouncedQuery, type, sex, page]
  );

  const visiblePets = data?.data ?? [];
  const totalPets = data?.meta.total ?? 0;
  const totalPages = Math.max(1, data?.meta.last_page ?? 1);
  const currentPage = page;

  const changeFilter = (setter) => (next) => {
    setter(next);
    setPage(1);
  };

  const changeQuery = (value) => {
    setQuery(value);
    setPage(1);
  };

  const clearSearch = () => {
    setQuery("");
    setPage(1);
  };

  const changePage = (next) => {
    setPage(next);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="adoptable">
      <div className="page-back">
        <BackButton fallback="/" />
      </div>


      <section
        className="adoptable__header"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(77, 42, 0, 0.58),
              rgba(77, 42, 0, 0.58)
            ),
            url(${adoptablePetsHero})
          `,
        }}
      >
        <div className="adoptable__header-content">
          <p className="adoptable__eyebrow">
            Find a Companion
          </p>

          <h1>Adoptable Pets</h1>

          <p>
            Browse animals currently available for adoption
            and find a pet that may be the right match for your home.
          </p>
        </div>
      </section>


      <section
        className="adoptable__container"
        ref={listRef}
        style={{ scrollMarginTop: 90 }}
      >

        <div className="adoptable__filters">

          <SearchBar
            value={query}
            onChange={changeQuery}
            onClear={clearSearch}
            placeholder="Search by name, breed or species"
            label="Search adoptable pets"
          />

          <select
            value={type}
            onChange={(event) =>
              changeFilter(setType)(event.target.value)
            }
            aria-label="Animal type"
          >
            <option value="All">All Types</option>
            <option value="Dog">Dogs</option>
            <option value="Cat">Cats</option>
            <option value="Other">Others</option>
          </select>

          <select
            value={sex}
            onChange={(event) =>
              changeFilter(setSex)(event.target.value)
            }
            aria-label="Sex"
          >
            <option value="All">Any Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

        </div>


        <p className="adoptable__result-count">
          {loading ? "Loading pets..." : `${totalPets} ${totalPets === 1 ? "pet" : "pets"} found`}
        </p>


        {loading ? null : visiblePets.length > 0 ? (
          <div className="adoptable__grid">
            {visiblePets.map((pet) => (
              <PetPreviewCard key={pet.id} kind="adoptable" item={pet} />
            ))}
          </div>
        ) : (
          <div className="adoptable__empty" role="status">
            <h2>No pets match your search</h2>
            <p>Try different filters, or a different name, breed or species.</p>

            <button type="button" onClick={clearSearch}>
              Clear search
            </button>
          </div>
        )}


        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={changePage}
          label="Adoptable pets pages"
        />

      </section>

    </div>
  );
}

export default AdoptablePets;
