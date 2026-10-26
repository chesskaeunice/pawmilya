import { useEffect, useState } from "react";

import { siteInfo } from "../data/siteInfo.js";
import { getPublicSiteInfo } from "../services/siteService.js";

// The text shown until the API answers (and when it cannot be reached)
const FALLBACK = {
  name: "Pawmilya Animal Pound",
  address: siteInfo.contact.address,
  phone: siteInfo.contact.phone,
  email: siteInfo.contact.email,
  hours: siteInfo.contact.hours,
  vision:
    "A community where no pet is left without care, and every animal can find a loving family.",
  mission:
    "To connect adopters, pet owners and the animal pound through one simple platform for adoption, lost-and-found reports and pet education.",
};

let lastKnown = null;

// The pound's public information edited in Settings: { name, address, phone, email, hours, vision, mission }
function usePoundInfo() {
  const [info, setInfo] = useState(lastKnown ?? FALLBACK);

  useEffect(() => {
    let active = true;

    getPublicSiteInfo()
      .then(({ pound, about }) => {
        lastKnown = {
          name: pound.name ?? FALLBACK.name,
          address: pound.address ?? FALLBACK.address,
          phone: pound.phone ?? FALLBACK.phone,
          email: pound.email ?? FALLBACK.email,
          hours: pound.hours ?? FALLBACK.hours,
          vision: about.vision ?? FALLBACK.vision,
          mission: about.mission ?? FALLBACK.mission,
        };
        if (active) setInfo(lastKnown);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return info;
}

export default usePoundInfo;
