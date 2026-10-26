// Philippine addresses for the Profile page: province -> city / municipality -> barangay.
//
// Data: PSGC (Philippine Standard Geographic Code, Philippine Statistics Authority, CC BY 4.0)
// as bundled in the npm package "phil-reg-prov-mun-brgy" (ISC license). It is static JSON, there is
// no API call, and it is only loaded (dynamic import) when the Profile page asks for it.

const SMALL_WORDS = new Set(["of", "de", "del", "la", "las", "los", "sa", "ng", "y"]);
const ROMAN = /^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i;

// The data has ALL CAPS province and city names: "CITY OF BATAC" -> "City of Batac".
// Words that are already mixed case ("(Capital)") stay as they are.
function titleCase(name) {
  let first = true;

  return name.replace(/[A-Za-zÑñ]+/g, (word) => {
    const isFirst = first;
    first = false;

    if (word !== word.toUpperCase()) return word;

    const lower = word.toLowerCase();
    if (ROMAN.test(word)) return word;
    if (!isFirst && SMALL_WORDS.has(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
}

const NCR_REGION = "13";
const METRO_MANILA = "Metro Manila";
const MANILA = "City of Manila";
const MANILA_PROVINCE_CODE = "1339";

let loading = null;

// Resolves to { provinces, cities(province), barangays(province, city), pick(list, typed) }
export function loadPhLocations() {
  loading ??= Promise.all([
    import("phil-reg-prov-mun-brgy/src/json/provinces.json"),
    import("phil-reg-prov-mun-brgy/src/json/city-mun.json"),
    import("phil-reg-prov-mun-brgy/src/json/barangays.json"),
  ]).then(([provinceData, cityData, barangayData]) => build(
    provinceData.default,
    cityData.default,
    barangayData.default,
  ));

  return loading;
}

function build(provinceRows, cityRows, barangayRows) {
  // barangay names by city / municipality code
  const barangaysByMun = new Map();
  for (const row of barangayRows) {
    if (!barangaysByMun.has(row.mun_code)) barangaysByMun.set(row.mun_code, []);
    barangaysByMun.get(row.mun_code).push(row.name);
  }

  // province name -> Map(city name -> list of municipality codes)
  // Metro Manila (NCR) has no provinces: its four districts are shown as one "Metro Manila", and the
  // districts of the City of Manila (Tondo, Quiapo, ...) as one "City of Manila".
  const tree = new Map();
  const provinceName = new Map();

  for (const row of provinceRows) {
    const name = row.reg_code === NCR_REGION ? METRO_MANILA : titleCase(row.name);
    provinceName.set(row.prov_code, name);
    if (!tree.has(name)) tree.set(name, new Map());
  }

  for (const row of cityRows) {
    const province = provinceName.get(row.prov_code);
    if (!province) continue;

    const city = row.prov_code === MANILA_PROVINCE_CODE ? MANILA : titleCase(row.name);
    const cities = tree.get(province);
    if (!cities.has(city)) cities.set(city, []);
    cities.get(city).push(row.mun_code);
  }

  const sort = (list) => [...list].sort((a, b) => a.localeCompare(b, "en"));

  return {
    provinces: sort(tree.keys()),

    cities: (province) => sort(tree.get(province)?.keys() ?? []),

    barangays: (province, city) =>
      sort((tree.get(province)?.get(city) ?? []).flatMap((code) => barangaysByMun.get(code) ?? [])),

    // the suggestion that matches what was typed (ignoring case and extra spaces), or ""
    pick: (list, typed) => {
      const wanted = typed.trim().toLowerCase();
      return list.find((item) => item.toLowerCase() === wanted) ?? "";
    },
  };
}
