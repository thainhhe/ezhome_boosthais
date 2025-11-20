import React, { useEffect, useState } from "react";
import bookingService from "../services/bookingService";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await bookingService.getMyBookings();
        const bookingsList = data.bookings || data || [];
        // Sort theo ngày mới nhất (newest first)
        const sortedBookings = bookingsList.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        if (mounted) setBookings(sortedBookings);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải đặt chỗ. Kiểm tra kết nối.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="pt-24 p-4">Đang tải đặt chỗ...</div>;

  return (
    <div className="min-h-screen pt-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Đặt chỗ của tôi</h2>
          <div className="text-sm text-gray-600">
            Tổng: <span className="font-semibold">{bookings.length}</span> đặt chỗ
          </div>
        </div>

        {/* Thống kê nhanh */}
        {bookings.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-yellow-700">
                {bookings.filter(b => b.status === "pending").length}
              </div>
              <div className="text-xs text-yellow-600">Chờ xác nhận</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-700">
                {bookings.filter(b => b.status === "completed").length}
              </div>
              <div className="text-xs text-green-600">Đã xác nhận</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-red-700">
                {bookings.filter(b => b.status === "cancelled").length}
              </div>
              <div className="text-xs text-red-600">Đã hủy</div>
            </div>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-gray-600">Bạn chưa có đặt chỗ nào.</div>
        ) : (
          <ul className="space-y-4">
            {bookings.map((b) => (
              <li key={b._id} className="border p-4 rounded hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-2">
                      {b.room?.title || "(phòng đã xóa)"}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      💰 Giá: {b.totalAmount?.toLocaleString() || "0"} đ
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500">Trạng thái:</span>
                      {b.status === "pending" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⏳ Chờ xác nhận
                        </span>
                      ) : b.status === "completed" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Đã xác nhận
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ✗ Đã hủy
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      📅 Đặt lúc: {new Date(b.createdAt).toLocaleString("vi-VN")}
                    </div>
                    {b.updatedAt && b.updatedAt !== b.createdAt && (
                      <div className="text-xs text-gray-400">
                        🔄 Cập nhật: {new Date(b.updatedAt).toLocaleString("vi-VN")}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {b.room?._id && (
                      <Link
                        to={`/rooms/${b.room._id || b.room.id}`}
                        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors text-sm"
                      >
                        Xem phòng
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
