import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRoomById } from "../services/adminService";

export default function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainMedia, setMainMedia] = useState({ type: "image", src: null });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getRoomById(id);
        if (mounted) setRoom(data);
        // initialize main media when data loaded
        if (mounted) {
          const firstImage =
            data?.media?.images?.[0]?.url ||
            (Array.isArray(data?.media?.images) && data.media.images[0]) ||
            null;
          const firstVideo =
            data?.media?.videos?.[0]?.url ||
            (Array.isArray(data?.media?.videos) && data.media.videos[0]) ||
            null;
          if (firstImage) setMainMedia({ type: "image", src: firstImage });
          else if (firstVideo) setMainMedia({ type: "video", src: firstVideo });
          else setMainMedia({ type: "image", src: "/placeholder-room.jpg" });
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="pt-24 p-4">Loading...</div>;
  if (error) return <div className="pt-24 p-4">Error loading room</div>;
  if (!room) return <div className="pt-24 p-4">Room not found</div>;

  return (
    <div className="min-h-screen pt-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-start gap-6">
          <div className="w-2/5">
            {/* Main media viewer (image or video) */}
            <div className="w-full h-64 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
              {mainMedia?.type === "video" ? (
                <video
                  key={mainMedia.src}
                  src={mainMedia.src}
                  controls
                  className="w-full h-64 object-cover"
                />
              ) : (
                <img
                  src={
                    mainMedia?.src ||
                    room.media?.images?.[0]?.url ||
                    "/placeholder-room.jpg"
                  }
                  alt={room.title}
                  className="w-full h-64 object-cover"
                />
              )}
            </div>

            {/* Thumbnails */}
            <div className="mt-3 flex gap-2 items-center overflow-x-auto">
              {/* image thumbnails */}
              {(room.media?.images || []).map((img, idx) => {
                const src = img?.url || img;
                const active =
                  mainMedia?.type === "image" && mainMedia?.src === src;
                return (
                  <button
                    key={img?.public_id || src || idx}
                    onClick={() => setMainMedia({ type: "image", src })}
                    className={`w-16 h-16 rounded overflow-hidden border ${
                      active ? "border-amber-500" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={src}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}

              {/* video thumbnails */}
              {(room.media?.videos || []).map((v, idx) => {
                const src = v?.url || v;
                const active =
                  mainMedia?.type === "video" && mainMedia?.src === src;
                return (
                  <button
                    key={v?.public_id || src || `v-${idx}`}
                    onClick={() => setMainMedia({ type: "video", src })}
                    className={`w-16 h-16 rounded overflow-hidden border bg-black/5 relative ${
                      active ? "border-amber-500" : "border-gray-200"
                    }`}
                  >
                    {/* show a small muted autoplay preview if supported, otherwise fallback to poster-like video element */}
                    <video
                      src={src}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-black"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{room.title}</h1>
            <p className="text-gray-600 mt-2">
              {(() => {
                const street = room.address?.street || "";
                const district = room.address?.district || "";
                const city = room.address?.city || "";
                const parts = [];
                if (street) parts.push(street);
                if (district) parts.push(district);
                if (city) parts.push(city);
                return parts.join(", ");
              })()}
            </p>
            <p className="text-amber-600 font-medium mt-4">
              {room.rentPrice?.toLocaleString()} vnđ
            </p>
            <p className="mt-4 text-sm text-gray-700">{room.description}</p>

            {/* Utilities */}
            <div className="mt-4">
              <h4 className="font-semibold">Utilities</h4>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                {room.utilities?.furnitureDetails && (
                  <li>Furniture: {room.utilities.furnitureDetails}</li>
                )}
                <li>Electricity: {room.utilities?.electricityCost ?? 0} vnđ</li>
                <li>Water: {room.utilities?.waterCost ?? 0} vnđ</li>
                <li>Wifi: {room.utilities?.wifiCost ?? 0} vnđ</li>
                <li>Parking: {room.utilities?.parkingCost ?? 0} vnđ</li>
              </ul>
            </div>

            {/* 360 link */}
            {room.media?.link360 && (
              <div className="mt-4">
                <h4 className="font-semibold">360° View</h4>
                <div className="mt-2 w-full h-64">
                  <iframe
                    title="360-view"
                    src={room.media.link360}
                    className="w-full h-full border rounded"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Videos */}
            {/* {room.media?.videos && room.media.videos.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold">Videos</h4>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {room.media.videos.map((v, idx) => (
                    <video
                      key={v.public_id || idx}
                      src={v.url || v}
                      controls
                      className="w-full h-44 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )} */}

            <div className="mt-6">
              <Link to="/rooms" className="px-3 py-2 bg-gray-200 rounded">
                Back to list
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
