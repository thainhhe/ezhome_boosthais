// Simple location service that tries open.oapi.vn first and falls back to a known public API
// Exports: getProvinces(), getDistricts(provinceCode)
const BASE = "https://open.oapi.vn";
const LOCAL_PROXY = "/api/locations"; // server-side proxy to avoid CORS
const FALLBACK = "https://provinces.open-api.vn/api";

let provincesCache = null; // array of { code, name, districts?: [{code,name}] }
let districtsCache = {}; // map provinceCode -> districts array

async function fetchJsonWithTimeout(url, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } finally {
    clearTimeout(id);
  }
}

function normalizeProvinces(data) {
  // Many APIs return array of provinces with properties like { name, code, districts }
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((p) => {
      // different APIs may use 'province' or 'name' or 'code' keys
      const name =
        p.name ||
        p.province ||
        p.provinceName ||
        p.province_name ||
        p.ten ||
        p.ProvinceName;
      const code =
        p.code ||
        p.province_id ||
        p.provinceCode ||
        p.provinceCode ||
        p._id ||
        p.codeProvince;
      const districts =
        p.districts || p.district || p.quan_huyen || p.districts || null;
      const normDistricts = Array.isArray(districts)
        ? districts.map((d) => ({
            name:
              d.name ||
              d.district ||
              d.districtName ||
              d.ten ||
              d.ProvinceName ||
              d.type ||
              d.label ||
              d.fullname ||
              "",
            code:
              d.code ||
              d.district_id ||
              d.districtCode ||
              d._id ||
              d.code ||
              "",
          }))
        : undefined;
      return {
        name: String(name || ""),
        code: String(code || name || ""),
        districts: normDistricts,
      };
    });
  }
  // if it's an object with provinces field
  if (typeof data === "object" && data.provinces) {
    return normalizeProvinces(data.provinces);
  }
  return [];
}

export async function getProvinces() {
  if (provincesCache) return provincesCache;

  // Prefer the public fallback which is known to be reliable, then try the open.oapi.vn host
  // Try local server-side proxy first (avoids CORS)
  const proxyUrl = `${LOCAL_PROXY}/provinces`;
  try {
    const data = await fetchJsonWithTimeout(proxyUrl);
    const list = normalizeProvinces(data);
    if (Array.isArray(list) && list.length > 0) {
      provincesCache = list;
      for (const p of list)
        if (p.districts && p.districts.length)
          districtsCache[p.code] = p.districts;
      return provincesCache;
    }
  } catch (err) {
    // fall through to public endpoints
  }

  const tries = [
    `${FALLBACK}/?depth=2`,
    `${FALLBACK}/`,
    `${FALLBACK}/p`,
    `${BASE}/api/?depth=2`,
    `${BASE}/api/provinces`,
    `${BASE}/provinces`,
  ];

  for (const url of tries) {
    try {
      const data = await fetchJsonWithTimeout(url);
      const list = normalizeProvinces(data);
      if (Array.isArray(list) && list.length > 0) {
        provincesCache = list;
        // also populate districts cache if present
        for (const p of list) {
          if (p.districts && p.districts.length)
            districtsCache[p.code] = p.districts;
        }
        return provincesCache;
      }
    } catch (err) {
      if (url.startsWith(BASE)) {
        console.debug(
          "locationService: open.oapi.vn endpoint failed:",
          url,
          err.message
        );
      }
    }
  }

  // if all fails return empty array
  provincesCache = [];
  return provincesCache;
}

export async function getDistricts(provinceCode) {
  if (!provinceCode) return [];
  if (districtsCache[provinceCode]) return districtsCache[provinceCode];

  // if provincesCache has district info, use that
  if (provincesCache) {
    const prov = provincesCache.find(
      (p) =>
        String(p.code) === String(provinceCode) ||
        String(p.name) === String(provinceCode)
    );
    if (prov && prov.districts) {
      districtsCache[provinceCode] = prov.districts;
      return districtsCache[provinceCode];
    }
  }

  // try fetching by province id from likely endpoints
  const tries = [
    // try local proxy first
    `${LOCAL_PROXY}/districts/${encodeURIComponent(provinceCode)}`,
    `${BASE}/api/p/${provinceCode}?depth=2`,
    `${BASE}/api/districts?province=${provinceCode}`,
    `${BASE}/districts?province=${provinceCode}`,
    // fallback to open-api
    `${FALLBACK}/p/${provinceCode}?depth=2`,
    `${FALLBACK}/p/${provinceCode}`,
  ];

  for (const url of tries) {
    try {
      const data = await fetchJsonWithTimeout(url);
      // if data is an object with districts or a province object
      if (Array.isArray(data)) {
        const list = data.map((d) => ({
          name: d.name || d.district || "",
          code: d.code || d.district_id || d._id || d.code || "",
        }));
        districtsCache[provinceCode] = list;
        return list;
      }
      if (data && data.districts) {
        const list = data.districts.map((d) => ({
          name: d.name || d.district || "",
          code: d.code || d.district_id || d._id || "",
        }));
        districtsCache[provinceCode] = list;
        return list;
      }
    } catch (err) {
      // continue
    }
  }

  districtsCache[provinceCode] = [];
  return [];
}

export function clearLocationCache() {
  provincesCache = null;
  districtsCache = {};
}

export default { getProvinces, getDistricts, clearLocationCache };
