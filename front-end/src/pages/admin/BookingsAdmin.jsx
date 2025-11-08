import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await adminService.updateBookingStatus(id, status);
      toast.success("Cập nhật trạng thái thành công");
      fetch();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Bookings (All)</h2>
          <div>
            <button
              onClick={() => (window.location.href = "/admin")}
              className="px-3 py-1 bg-gray-200 rounded mr-2"
            >
              Back
            </button>
            <Link
              to="/admin/rooms"
              className="px-3 py-1 bg-orange-600 text-white rounded"
            >
              Rooms
            </Link>
          </div>
        </div>
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Booking ID</th>
                <th className="p-3">User</th>
                <th className="p-3">Room</th>
                <th className="p-3">Amount</th>
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
              ) : bookings && bookings.length ? (
                bookings.map((b) => (
                  <tr key={b._id} className="border-t">
                    <td className="p-3">{b._id}</td>
                    <td className="p-3">{b.user?.email || b.user}</td>
                    <td className="p-3">{b.room?.title || b.room}</td>
                    <td className="p-3">{b.totalAmount}</td>
                    <td className="p-3 capitalize">{b.status}</td>
                    <td className="p-3">
                      {b.status !== "completed" && (
                        <button
                          onClick={() => updateStatus(b._id, "completed")}
                          className="mr-2 px-3 py-1 bg-emerald-600 text-white rounded"
                        >
                          Mark Completed
                        </button>
                      )}
                      {b.status !== "cancelled" && (
                        <button
                          onClick={() => updateStatus(b._id, "cancelled")}
                          className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4" colSpan={6}>
                    No bookings
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
