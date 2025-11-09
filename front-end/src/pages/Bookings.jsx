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
        if (mounted) setBookings(data.bookings || data || []);
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
        <h2 className="text-xl font-semibold mb-4">Đặt chỗ của tôi</h2>

        {bookings.length === 0 ? (
          <div className="text-gray-600">Bạn chưa có đặt chỗ nào.</div>
        ) : (
          <ul className="space-y-4">
            {bookings.map((b) => (
              <li key={b._id} className="border p-4 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      {b.room?.title || "(phòng đã xóa)"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Giá: {b.totalAmount?.toLocaleString() || "0"} vnđ
                    </div>
                    <div className="text-sm text-gray-500">
                      Trạng thái: {b.status}
                    </div>
                    <div className="text-sm text-gray-400">ID: {b._id}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Link
                      to={`/rooms/${b.room?._id || b.room?.id}`}
                      className="px-3 py-2 bg-emerald-600 text-white rounded"
                    >
                      Xem phòng
                    </Link>
                    <div className="text-xs text-gray-500">
                      {new Date(b.createdAt).toLocaleString()}
                    </div>
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
