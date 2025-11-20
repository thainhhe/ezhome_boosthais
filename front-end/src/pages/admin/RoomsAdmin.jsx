import React, { useEffect, useState } from "react";
import { adminService, deleteRoom } from "../../services/adminService";
import RoomForm from "./RoomForm";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function RoomsAdmin() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // room to edit or null
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "inactive", "active"
  const navigate = useNavigate();

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await adminService.getRooms();
      setRooms(Array.isArray(data) ? data : data?.rooms || data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const onCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const onEdit = (room) => {
    setEditing(room);
    setShowForm(true);
  };

  const onDelete = async (id) => {
    if (!confirm("Xóa phòng này?")) return;
    try {
      await deleteRoom(id);
      toast.success("Đã xóa phòng");
      fetch();
    } catch (err) {
      console.error(err);
      toast.error("Xóa phòng thất bại");
    }
  };

  const onSaved = (res) => {
    setShowForm(false);
    setEditing(null);
    fetch();
  };

  return (
    <div className="min-h-screen pt-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Rooms Management</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Lọc:</span>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded text-sm ${
                  statusFilter === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Tất cả ({rooms.length})
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-3 py-1 rounded text-sm ${
                  statusFilter === "inactive"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Còn trống ({rooms.filter(r => r.status === "inactive").length})
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1 rounded text-sm ${
                  statusFilter === "active"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Đã thuê ({rooms.filter(r => r.status === "active").length})
              </button>
            </div>
          </div>
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="px-3 py-1 bg-gray-200 rounded mr-2 hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Create Room
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-3">
              {editing ? "Edit Room" : "Create Room"}
            </h3>
            <RoomForm
              initial={editing || {}}
              onSaved={onSaved}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        )}

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Location</th>
                <th className="p-3">Price</th>
                <th className="p-3">Area</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4" colSpan={6}>
                    Loading...
                  </td>
                </tr>
              ) : rooms && rooms.length ? (
                rooms
                  .filter(r => statusFilter === "all" || r.status === statusFilter)
                  .map((r) => (
                  <tr key={r._id} className="border-t">
                    <td className="p-3">{r.title}</td>
                    <td className="p-3">
                      {r.address?.city}, {r.address?.district}
                    </td>
                    <td className="p-3">{r.rentPrice?.toLocaleString()} đ</td>
                    <td className="p-3">{r.area} m²</td>
                    <td className="p-3">
                      {r.status === "inactive" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Còn trống
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Đã thuê
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => onEdit(r)}
                        className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(r._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={6}>
                    {rooms.length === 0 
                      ? "Chưa có phòng nào" 
                      : `Không có phòng ${statusFilter === "inactive" ? "còn trống" : statusFilter === "active" ? "đã thuê" : ""}`
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
