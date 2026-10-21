import { getSiteInfo } from "../services/siteService.js";
import useFetch from "./useFetch.js";

// One shared request for the footer, modals and Home (kept for a minute, like the server cache)
let cached = { promise: null, at: 0 };

function loadSiteInfo() {
  if (!cached.promise || Date.now() - cached.at > 60000) {
    cached = {
      at: Date.now(),
      promise: getSiteInfo().catch((error) => {
        cached = { promise: null, at: 0 };
        throw error;
      }),
    };
  }

  return cached.promise;
}

// Returns the public site info, or null while loading / when the API is down
function useSiteInfo() {
  return useFetch(loadSiteInfo, []).data;
}

export default useSiteInfo;
