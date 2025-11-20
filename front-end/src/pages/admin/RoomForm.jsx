import React, { useState, useEffect } from "react";
import { createRoom, updateRoom } from "../../services/adminService";
import toast from "react-hot-toast";
import locationService from "../../services/locationService";

export default function RoomForm({ initial = {}, onSaved, onCancel }) {
  // initial may come from a Room document (nested structure)
  const [title, setTitle] = useState(initial.title || "");
  const [rentPrice, setRentPrice] = useState(initial.rentPrice || "");
  const [area, setArea] = useState(initial.area || "");
  const [street, setStreet] = useState(initial.address?.street || "");
  const [description, setDescription] = useState(initial.description || "");
  const [link360, setLink360] = useState(initial.media?.link360 || "");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [furnitureDetails, setFurnitureDetails] = useState(
    initial.furnitureDetails || ""
  );
  const [electricityCost, setElectricityCost] = useState(
    initial.electricityCost || 0
  );
  const [waterCost, setWaterCost] = useState(initial.waterCost || 0);
  const [wifiCost, setWifiCost] = useState(initial.wifiCost || 0);
  const [parkingCost, setParkingCost] = useState(initial.parkingCost || 0);
  const [status, setStatus] = useState(initial.status || "inactive");
  const [submitting, setSubmitting] = useState(false);

  // location states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [provinceCode, setProvinceCode] = useState(initial.address?.city || "");
  const [districtCode, setDistrictCode] = useState(
    initial.address?.district || ""
  );
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    setTitle(initial.title || "");
    setRentPrice(initial.rentPrice || "");
    setArea(initial.area || "");
    // nested address in DB
    setStreet(initial.address?.street || "");
    setDescription(initial.description || "");
    setProvinceCode(initial.address?.city || "");
    setDistrictCode(initial.address?.district || "");
    setLink360(initial.media?.link360 || "");
    setFurnitureDetails(initial.utilities?.furnitureDetails || "");
    setElectricityCost(initial.utilities?.electricityCost || 0);
    setWaterCost(initial.utilities?.waterCost || 0);
    setWifiCost(initial.utilities?.wifiCost || 0);
    setParkingCost(initial.utilities?.parkingCost || 0);
    setStatus(initial.status || "inactive");
  }, [initial]);

  // load provinces on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingProvinces(true);
      try {
        const list = await locationService.getProvinces();
        if (!mounted) return;
        setProvinces(list);
        const initialCity = initial.address?.city || initial.city;
        if (initialCity) {
          const match = list.find(
            (p) =>
              String(p.code) === String(initialCity) ||
              String(p.name) === String(initialCity)
          );
          if (match) {
            setProvinceCode(match.code);
            setLoadingDistricts(true);
            try {
              const ds = await locationService.getDistricts(match.code);
              if (!mounted) return;
              setDistricts(ds);
              const initialDistrict =
                initial.address?.district || initial.district;
              if (initialDistrict) {
                const dmatch = ds.find(
                  (d) =>
                    String(d.code) === String(initialDistrict) ||
                    String(d.name) === String(initialDistrict)
                );
                if (dmatch) setDistrictCode(dmatch.code);
              }
            } finally {
              setLoadingDistricts(false);
            }
          }
        }
      } catch (err) {
        // ignore
      } finally {
        setLoadingProvinces(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  // when province changes, load districts
  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setDistrictCode("");
      return;
    }
    let mounted = true;
    (async () => {
      setLoadingDistricts(true);
      try {
        const ds = await locationService.getDistricts(provinceCode);
        if (!mounted) return;
        setDistricts(ds || []);
      } catch (err) {
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    })();
    return () => (mounted = false);
  }, [provinceCode]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // basic validation
      if (!provinceCode) {
        toast.error("Vui lòng chọn Tỉnh/Thành");
        setSubmitting(false);
        return;
      }
      if (!districtCode) {
        toast.error("Vui lòng chọn Quận/Huyện");
        setSubmitting(false);
        return;
      }

      const fd = new FormData();
      fd.append("title", title);
      fd.append("rentPrice", String(rentPrice));
      fd.append("area", String(area));
      // append both code and name
      const provinceName =
        provinces.find((p) => String(p.code) === String(provinceCode))?.name ||
        provinceCode ||
        "";
      const districtName =
        districts.find((d) => String(d.code) === String(districtCode))?.name ||
        districtCode ||
        "";
      fd.append("city", provinceName);
      fd.append("district", districtName);
      fd.append("cityCode", provinceCode || "");
      fd.append("districtCode", districtCode || "");
      fd.append("street", street);
      fd.append("link360", link360 || "");
      fd.append("furnitureDetails", furnitureDetails || "");
      fd.append("electricityCost", String(electricityCost || 0));
      fd.append("waterCost", String(waterCost || 0));
      fd.append("wifiCost", String(wifiCost || 0));
      fd.append("parkingCost", String(parkingCost || 0));
      fd.append("status", status);
      fd.append("description", description);
      for (const f of images) fd.append("images", f);
      for (const v of videos) fd.append("videos", v);

      let res;
      if (initial._id) {
        res = await updateRoom(initial._id, fd);
        toast.success("Room updated");
      } else {
        res = await createRoom(fd);
        toast.success("Room created");
      }
      onSaved && onSaved(res);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu phòng");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full p-2 border rounded"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm">Rent Price</label>
          <input
            type="number"
            value={rentPrice}
            onChange={(e) => setRentPrice(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm">Area (m²)</label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm">Tỉnh / Thành</label>
          <select
            value={provinceCode}
            onChange={(e) => setProvinceCode(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
          >
            <option value="">-- Chọn Tỉnh/Thành --</option>
            {loadingProvinces ? (
              <option value="">Đang tải...</option>
            ) : (
              provinces.map((p) => (
                <option key={p.code || p.name} value={p.code || p.name}>
                  {p.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Quận / Huyện</label>
          <select
            value={districtCode}
            onChange={(e) => setDistrictCode(e.target.value)}
            disabled={!provinceCode || loadingDistricts}
            className="mt-1 block w-full p-2 border rounded"
          >
            <option value="">-- Chọn Quận/Huyện --</option>
            {loadingDistricts ? (
              <option value="">Đang tải...</option>
            ) : (
              districts.map((d) => (
                <option key={d.code || d.name} value={d.code || d.name}>
                  {d.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm">Street</label>
          <input
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-sm">360° Link (link360)</label>
          <input
            value={link360}
            onChange={(e) => setLink360(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm">Furniture details</label>
          <input
            value={furnitureDetails}
            onChange={(e) => setFurnitureDetails(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
            placeholder="e.g. Full furnished with bed, table..."
          />
        </div>

        <div>
          <label className="block text-sm">Trạng thái phòng</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full p-2 border rounded"
          >
            <option value="inactive">Inactive (Còn trống)</option>
            <option value="active">Active (Đã cho thuê)</option>
          </select>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-sm">Electricity (vnđ)</label>
            <input
              type="number"
              value={electricityCost}
              onChange={(e) => setElectricityCost(e.target.value)}
              className="mt-1 block w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Water (vnđ)</label>
            <input
              type="number"
              value={waterCost}
              onChange={(e) => setWaterCost(e.target.value)}
              className="mt-1 block w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Wifi (vnđ)</label>
            <input
              type="number"
              value={wifiCost}
              onChange={(e) => setWifiCost(e.target.value)}
              className="mt-1 block w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Parking (vnđ)</label>
            <input
              type="number"
              value={parkingCost}
              onChange={(e) => setParkingCost(e.target.value)}
              className="mt-1 block w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm">Images (multiple)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files || []))}
        />
      </div>
      <div>
        <label className="block text-sm">Videos (multiple)</label>
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => setVideos(Array.from(e.target.files || []))}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
