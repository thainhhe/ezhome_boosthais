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
          <h2 className="text-2xl font-semibold">Rooms Management</h2>
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="px-3 py-1 bg-gray-200 rounded mr-2"
            >
              Back
            </button>
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
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
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              ) : rooms && rooms.length ? (
                rooms.map((r) => (
                  <tr key={r._id} className="border-t">
                    <td className="p-3">{r.title}</td>
                    <td className="p-3">
                      {r.address?.city}, {r.address?.district}
                    </td>
                    <td className="p-3">{r.rentPrice}</td>
                    <td className="p-3">{r.area}</td>
                    <td className="p-3">
                      <button
                        onClick={() => onEdit(r)}
                        className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(r._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4" colSpan={5}>
                    No rooms
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
