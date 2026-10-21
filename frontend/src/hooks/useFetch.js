import { useCallback, useEffect, useState } from "react";

// Loads data from an API call and reloads when `deps` change.
//   const { data, error, loading, reload } = useFetch(() => getPet(id), [id]);
// `error` is the Axios error (error.response?.status === 404 for "not found").
function useFetch(loader, deps) {
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  const key = JSON.stringify([...deps, tick]);

  useEffect(() => {
    let active = true;

    loader()
      .then((data) => active && setResult({ key, data, error: null }))
      .catch((error) => active && setResult({ key, data: null, error }));

    return () => {
      active = false;
    };
    // `loader` is recreated on every render; the key already covers its inputs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  const loading = result.key !== key;

  // `data` keeps the previous result while a new request loads (check `loading` first)
  return {
    data: result.data,
    error: loading ? null : result.error,
    loading,
    reload,
  };
}

export default useFetch;
