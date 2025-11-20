import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getRoomById } from "../services/adminService";
import useAuthStore from "../stores/authStore";

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

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen pt-24 px-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Lỗi khi tải thông tin phòng</p>
          <Link to="/rooms" className="mt-4 inline-block text-amber-600 hover:underline">
            ← Quay lại danh sách phòng
          </Link>
        </div>
      </div>
    );
  }
  
  if (!room) {
    return (
      <div className="min-h-screen pt-24 px-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Không tìm thấy phòng</p>
          <Link to="/rooms" className="mt-4 inline-block text-amber-600 hover:underline">
            ← Quay lại danh sách phòng
          </Link>
        </div>
      </div>
    );
  }

  const fullAddress = [
    room.address?.street,
    room.address?.district,
    room.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen pt-24 px-4 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link to="/rooms" className="text-amber-600 hover:underline text-sm">
            ← Quay lại danh sách phòng
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Media Gallery */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Media Viewer */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                {mainMedia?.type === "video" ? (
                  <video
                    key={mainMedia.src}
                    src={mainMedia.src}
                    controls
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <img
                    src={
                      mainMedia?.src ||
                      room.media?.images?.[0]?.url ||
                      "/placeholder-room.jpg"
                    }
                    alt={room.title}
                    className="w-full h-96 object-cover"
                  />
                )}
              </div>

              {/* Thumbnails */}
              <div className="p-4 bg-white border-t">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {/* Image thumbnails */}
                  {(room.media?.images || []).map((img, idx) => {
                    const src = img?.url || img;
                    const active =
                      mainMedia?.type === "image" && mainMedia?.src === src;
                    return (
                      <button
                        key={img?.public_id || src || idx}
                        onClick={() => setMainMedia({ type: "image", src })}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          active
                            ? "border-amber-500 ring-2 ring-amber-200"
                            : "border-gray-200 hover:border-amber-300"
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

                  {/* Video thumbnails */}
                  {(room.media?.videos || []).map((v, idx) => {
                    const src = v?.url || v;
                    const active =
                      mainMedia?.type === "video" && mainMedia?.src === src;
                    return (
                      <button
                        key={v?.public_id || src || `v-${idx}`}
                        onClick={() => setMainMedia({ type: "video", src })}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 bg-black/5 relative transition-all ${
                          active
                            ? "border-amber-500 ring-2 ring-amber-200"
                            : "border-gray-200 hover:border-amber-300"
                        }`}
                      >
                        <video
                          src={src}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                            <svg
                              className="w-4 h-4 text-amber-600 ml-0.5"
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
            </div>

            {/* 360° View - Made Larger */}
            {room.media?.link360 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b bg-gradient-to-r from-cyan-50 to-white">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Xem phòng 360°
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Xoay để khám phá không gian phòng</p>
                </div>
                <div className="w-full h-[500px]">
                  <iframe
                    title="360-view"
                    src={room.media.link360}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-cyan-50 to-white">
                <h3 className="text-lg font-semibold text-gray-800">Mô tả chi tiết</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {room.description || "Chưa có mô tả chi tiết"}
                </p>
              </div>
            </div>

            {/* Utilities Details */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-cyan-50 to-white">
                <h3 className="text-lg font-semibold text-gray-800">Tiện ích & Chi phí</h3>
              </div>
              <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {room.utilities?.furnitureDetails && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Nội thất</p>
                      <p className="text-sm text-gray-600">{room.utilities.furnitureDetails}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Tiền điện</p>
                    <p className="text-lg text-blue-600 font-semibold">
                      {room.utilities?.electricityCost?.toLocaleString() || 0} đ/kWh
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Tiền nước</p>
                    <p className="text-lg text-cyan-600 font-semibold">
                      {room.utilities?.waterCost?.toLocaleString() || 0} đ/m³
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Tiền Wifi</p>
                    <p className="text-lg text-green-600 font-semibold">
                      {room.utilities?.wifiCost?.toLocaleString() || 0} đ/tháng
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Tiền gửi xe</p>
                    <p className="text-lg text-purple-600 font-semibold">
                      {room.utilities?.parkingCost?.toLocaleString() || 0} đ/tháng
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{room.title}</h1>
              
              {/* Price */}
              <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Giá thuê</p>
                <p className="text-3xl font-bold text-amber-600">
                  {room.rentPrice?.toLocaleString()} đ
                </p>
                <p className="text-sm text-gray-500">/ tháng</p>
              </div>

              {/* Key Info */}
              <div className="space-y-3 mb-6">
                {/* Area */}
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Diện tích</p>
                    <p className="font-semibold">{room.area || "N/A"} m²</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-medium">{fullAddress}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <p className={`font-semibold ${room.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                      {room.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                {room.createdAt && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày đăng</p>
                      <p className="font-medium">
                        {new Date(room.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <BookButton
                  roomId={room._id || room.id}
                  rentPrice={room.rentPrice}
                  roomTitle={room.title}
                />
                <Link 
                  to="/rooms" 
                  className="block w-full px-4 py-3 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Xem phòng khác
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookButton({ roomId, rentPrice, roomTitle }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const handleBook = () => {
    if (!isAuthenticated) {
      navigate("/?auth=login");
      return;
    }
    // navigate to checkout with state and query param (query param helps survive redirects/refresh)
    navigate(`/checkout?roomId=${roomId}`, {
      state: { roomId: roomId, roomTitle: roomTitle, roomPrice: rentPrice },
    });
  };

  return (
    <button
      onClick={handleBook}
      disabled={loading}
      className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Đặt phòng ngay</span>
        </>
      )}
    </button>
  );
}
