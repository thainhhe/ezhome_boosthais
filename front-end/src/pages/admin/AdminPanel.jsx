import React from "react";
import { Link } from "react-router-dom";

export default function AdminPanel() {
  return (
    <div className="min-h-screen pt-24 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-cyan-50 mt-2">Quản lý hệ thống</p>
        </div>

        <div className="flex gap-3 mb-6">
          <Link
            to="/admin/users"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/bookings"
            className="inline-block px-4 py-2 bg-emerald-600 text-white rounded"
          >
            Manage Bookings
          </Link>
          <Link
            to="/admin/rooms"
            className="inline-block px-4 py-2 bg-orange-600 text-white rounded"
          >
            Manage Rooms
          </Link>
        </div>

        <div className="bg-white rounded shadow p-6">
          <p className="text-gray-700">Select a section above to manage.</p>
        </div>
      </div>
    </div>
  );
}
