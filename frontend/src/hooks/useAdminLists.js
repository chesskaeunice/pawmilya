import { useMemo } from "react";

import useAuth from "./useAuth.js";
import useFetch from "./useFetch.js";
import { fetchAdminLists } from "../services/adminService.js";

const EMPTY = [];

// The animals, applications, missing pet reports and vaccinations that the staff
// dashboards and Reports show. Lists a role may not view come back empty.
//   const { animals, applications, missingPets, vaccinations, loading, reload } = useAdminLists();
function useAdminLists() {
  const { role, can } = useAuth();

  const { data, loading, reload } = useFetch(
    () =>
      fetchAdminLists({
        animals: can("animals.view"),
        applications: can("adoptionApplications.view"),
        missingPets: can("missingPets.view"),
        vaccinations: can("vaccinations.view"),
      }),
    [role]
  );

  return useMemo(
    () => ({
      animals: data?.animals ?? EMPTY,
      applications: data?.applications ?? EMPTY,
      missingPets: data?.missingPets ?? EMPTY,
      vaccinations: data?.vaccinations ?? EMPTY,
      loading,
      reload,
    }),
    [data, loading, reload]
  );
}

export default useAdminLists;
