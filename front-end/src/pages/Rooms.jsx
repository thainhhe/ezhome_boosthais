import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import { adminService } from "../services/adminService";
import locationService from "../services/locationService";

export default function Rooms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);

  const city = searchParams.get("city") || "";
  const district = searchParams.get("district") || "";

  useEffect(() => {
    (async () => {
      const list = await locationService.getProvinces();
      setProvinces(list);
    })();
  }, []);

  useEffect(() => {
    if (city) {
      (async () => {
        const ds = await locationService.getDistricts(city);
        setDistricts(ds);
      })();
    } else {
      setDistricts([]);
    }
  }, [city]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (city) params.city = city;
        if (district) params.district = district;
        const data = await adminService.getRooms(params);
        const list = Array.isArray(data)
          ? data
          : data?.rooms || data?.data || [];
        if (mounted) setRooms(list);
      } catch (err) {
        console.error(err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [city, district, searchParams]);

  const onCityChange = (e) => {
    const next = new URLSearchParams(searchParams.toString());
    const v = e.target.value;
    if (v) next.set("city", v);
    else next.delete("city");
    next.delete("district"); // reset district when city changes
    setSearchParams(next);
  };

  const onDistrictChange = (e) => {
    const next = new URLSearchParams(searchParams.toString());
    const v = e.target.value;
    if (v) next.set("district", v);
    else next.delete("district");
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen pt-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Rooms</h2>
          <div>
            <Link to="/" className="px-3 py-1 bg-gray-200 rounded mr-2">
              Back
            </Link>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4 mb-4">
          <div className="flex gap-4 items-end flex-wrap">
            <div>
              <label className="block text-sm text-gray-600">Tỉnh/Thành</label>
              <select
                value={city}
                onChange={onCityChange}
                className="mt-1 border rounded px-3 py-2 w-56"
              >
                <option value="">-- All --</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.name || p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Quận/Huyện</label>
              <select
                value={district}
                onChange={onDistrictChange}
                className="mt-1 border rounded px-3 py-2 w-56"
                disabled={!city}
              >
                <option value="">-- All --</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.name || d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto">
              <button
                onClick={() => {
                  setSearchParams({});
                }}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error loading rooms</div>
          ) : rooms.length ? (
            rooms.map((r) => <RoomCard key={r._id || r.id} room={r} />)
          ) : (
            <div>No rooms found</div>
          )}
        </div>
      </div>
    </div>
  );
}
