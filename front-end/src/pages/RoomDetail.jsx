import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRoomById } from "../services/adminService";

export default function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getRoomById(id);
        if (mounted) setRoom(data);
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
            <img
              src={room.media?.images?.[0]?.url || "/placeholder-room.jpg"}
              alt={room.title}
              className="w-full h-64 object-cover rounded"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{room.title}</h1>
            <p className="text-gray-600 mt-2">
              {room.address?.city} • {room.address?.district}
            </p>
            <p className="text-amber-600 font-medium mt-4">
              {room.rentPrice?.toLocaleString()} đ
            </p>
            <p className="mt-4 text-sm text-gray-700">{room.description}</p>

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
