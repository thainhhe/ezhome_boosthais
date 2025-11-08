import React from "react";
import { Link } from "react-router-dom";

export default function RoomCard({ room, title, numbers, className }) {
  // Backward-compatible: if `room` not provided, use title/numbers props
  const displayTitle = room?.title || title || "Untitled";
  const displayNumbers =
    (room &&
      room.address &&
      `${room.address.city || ""} • ${room.address.district || ""}`) ||
    numbers ||
    "--";

  // Room images are stored under media.images[].url in the backend model
  const imgUrl =
    room?.media?.images?.[0]?.url ||
    room?.images?.[0]?.url ||
    "/placeholder-room.jpg"; // fallback image in public/

  const price = room?.rentPrice
    ? `${room.rentPrice.toLocaleString()} vnđ`
    : null;

  const container = (
    <div
      className={`w-64 md:w-72 lg:w-80 bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      <div className="h-44 bg-gray-100 p-0">
        <img
          src={imgUrl}
          alt={displayTitle}
          className="w-full h-44 object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder-room.jpg";
          }}
        />
      </div>
      <div className="bg-white text-gray-900 text-center py-4">
        <h3 className="text-lg font-semibold">{displayTitle}</h3>
        <p className="text-sm mt-1 text-gray-600">{displayNumbers}</p>
        {price && (
          <p className="text-sm mt-2 text-amber-600 font-medium">{price}</p>
        )}
      </div>
    </div>
  );

  // If we have a room object, make the whole card clickable to the detail page
  if (room && (room._id || room.id)) {
    return (
      <Link to={`/rooms/${room._id || room.id}`} className="inline-block">
        {container}
      </Link>
    );
  }

  return container;
}
