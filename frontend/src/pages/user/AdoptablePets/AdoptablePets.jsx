import { useMemo, useRef, useState } from "react";

import SearchBar from "../../../components/common/SearchBar.jsx";
import Pagination from "../../../components/common/Pagination.jsx";
import PetPreviewCard from "../../../components/landing/PetPreviewCard.jsx";

import { getAllAdoptablePets } from "../../../services/previewService.js";
import { matchesPetSearch } from "../../../utils/liveSearch.js";

import adoptablePetsHero from "../../../assets/images/users/home/adoptablePets-hero.jpg";

import "./AdoptablePets.css";

const PETS_PER_PAGE = 6;

const allPets = getAllAdoptablePets();

function AdoptablePets() {
  const listRef = useRef(null);

  // live search: the grid filters on every keystroke
  const [query, setQuery] = useState("");
  // Type filter: same options and rules as the original page
  const [type, setType] = useState("All");
  const [page, setPage] = useState(1);

  const filteredPets = useMemo(() => {
    return allPets.filter((pet) => {
      // name, breed or species
      const matchesSearch = matchesPetSearch(pet, query);

      const matchesType =
        type === "All" || pet.type === type;

      return matchesSearch && matchesType;
    });
  }, [query, type]);

  const totalPages = Math.max(1, Math.ceil(filteredPets.length / PETS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const visiblePets = filteredPets.slice(
    (currentPage - 1) * PETS_PER_PAGE,
    currentPage * PETS_PER_PAGE
  );

  const changeQuery = (value) => {
    setQuery(value);
    setPage(1);
  };

  const clearSearch = () => {
    setQuery("");
    setPage(1);
  };

  const changeType = (next) => {
    setType(next);
    setPage(1);
  };

  const changePage = (next) => {
    setPage(next);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="adoptable">

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
              changeType(event.target.value)
            }
            aria-label="Animal type"
          >
            <option value="All">All Types</option>
            <option value="Dog">Dogs</option>
            <option value="Cat">Cats</option>
          </select>

        </div>


        <p className="adoptable__result-count">
          {filteredPets.length} {filteredPets.length === 1 ? "pet" : "pets"} found
        </p>


        {visiblePets.length > 0 ? (
          <div className="adoptable__grid">
            {visiblePets.map((pet) => (
              <PetPreviewCard key={pet.id} kind="adoptable" item={pet} />
            ))}
          </div>
        ) : (
          <div className="adoptable__empty" role="status">
            <h2>No pets match your search</h2>
            <p>Try a different name, breed or species.</p>

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
