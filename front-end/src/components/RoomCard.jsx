import React from "react";

export default function RoomCard({ title, numbers, className }) {
  return (
    <div
      className={`w-64 md:w-72 lg:w-80 bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      <div className="h-44 bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 p-3 grid grid-cols-2 gap-2">
        <div className="bg-white rounded-md"></div>
        <div className="bg-white rounded-md"></div>
        <div className="bg-white rounded-md"></div>
        <div className="bg-white rounded-md"></div>
      </div>
      <div className="bg-teal-700 text-white text-center py-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm mt-2">{numbers}</p>
      </div>
    </div>
  );
}
