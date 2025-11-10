"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { createPortal } from "react-dom";
import useAuthStore from "../../stores/authStore";
import bookingService from "../../services/bookingService";
import { toast } from "react-hot-toast";
import CheckPayment from "./CheckPayment"; // updated CheckPayment
import { getRoomById } from "../../services/adminService";

// Modal shell using createPortal
function ModalShell({ children, isOpen, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>,
    document.body
  );
}

function generateQRCodeUrl(amount, message) {
  const bankId = "MB";
  const accountNo = "0974753813";
  const template = "compact2";
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${message}`;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, initialized } = useAuthStore();

  // room info may be passed from RoomDetail via navigate state or query string
  const state = location.state || {};
  const searchParams = new URLSearchParams(location.search || "");
  const queryRoomId = searchParams.get("roomId") || null;

  const [localRoomId, setLocalRoomId] = useState(state.roomId || queryRoomId);
  const [localRoomTitle, setLocalRoomTitle] = useState(state.roomTitle || "");
  const [localRoomPrice, setLocalRoomPrice] = useState(state.roomPrice || 0);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    paymentMethod: "bank_transfer",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [paymentCheckText, setPaymentCheckText] = useState("");
  const [totalAmount, setTotalAmount] = useState(localRoomPrice || 0);
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    if (initialized) {
      if (!isAuthenticated) {
        navigate("/?auth=login");
      } else if (!localRoomId) {
        toast.error("Không tìm thấy thông tin phòng. Vui lòng thử lại.");
        navigate("/rooms");
      }
    }
  }, [isAuthenticated, initialized, localRoomId, navigate]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // If only have room id (e.g. from query) or missing title/price, fetch room details
  useEffect(() => {
    let mounted = true;
    const loadRoom = async () => {
      if (!localRoomId) return;
      // If title and price already present, don't fetch
      if (localRoomTitle && localRoomPrice) return;
      try {
        const r = await getRoomById(localRoomId);
        if (!mounted) return;
        setLocalRoomTitle(r?.title || "");
        setLocalRoomPrice(r?.rentPrice || 0);
        setTotalAmount(r?.rentPrice || localRoomPrice || 0);
      } catch (err) {
        console.error("Failed to fetch room for checkout:", err);
        if (mounted) {
          toast.error("Không thể tải thông tin phòng. Vui lòng thử lại.");
          navigate("/rooms");
        }
      }
    };
    loadRoom();
    return () => (mounted = false);
  }, [localRoomId]);

  const formatPrice = (price) => price?.toLocaleString() + " vnđ";

  const generateRandomText = (length) => {
    const allowedCharacters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += allowedCharacters.charAt(
        Math.floor(Math.random() * allowedCharacters.length)
      );
    }
    return result;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setOrderError("Vui lòng nhập đầy đủ Họ tên và Số điện thoại.");
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    try {
      const res = await bookingService.createBooking({
        roomId: localRoomId,
        name: formData.name,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      });
      const booking = res.booking;
      if (!booking || !booking._id)
        throw new Error("Không thể tạo đơn đặt phòng.");

      setBookingId(booking._id);
      setTotalAmount(booking.totalAmount || localRoomPrice || totalAmount);

      if (formData.paymentMethod === "bank_transfer") {
        const paymentCode = `EZH${booking._id.slice(-6).toUpperCase()}`;
        setPaymentCheckText(paymentCode);
        setQrCodeValue(generateQRCodeUrl(booking.totalAmount, paymentCode));
        setShowQRCode(true);
      } else {
        toast.success("Đặt phòng thành công! Vui lòng chờ xác nhận.");
        navigate("/bookings");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      const msg =
        err?.response?.data?.message || err?.message || "Đặt phòng thất bại";
      setOrderError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialized || !localRoomId) {
    return (
      <div className="min-h-screen pt-24 px-4 bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Xác nhận Đặt phòng
        </h1>

        {orderError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {orderError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <form
            onSubmit={handleSubmit}
            className="md:col-span-2 bg-white rounded-lg shadow-md p-6 space-y-6"
          >
            <div>
              <h2 className="text-lg font-semibold mb-4">Thông tin liên hệ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Họ tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Phương thức thanh toán <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <div className="flex items-center p-3 border rounded-md">
                  <input
                    type="radio"
                    id="bank_transfer"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === "bank_transfer"}
                    onChange={handleChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <label
                    htmlFor="bank_transfer"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Chuyển khoản ngân hàng (QR Code)
                  </label>
                </div>
                <div className="flex items-center p-3 border rounded-md">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <label
                    htmlFor="cod"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Thanh toán sau (Admin sẽ liên hệ)
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ghi chú (Tùy chọn)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                placeholder="Ghi chú thêm cho chủ nhà..."
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-700 text-white py-3 px-4 rounded-md hover:bg-teal-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Đang xử lý..."
                  : formData.paymentMethod === "bank_transfer"
                  ? "Tiếp tục thanh toán"
                  : "Xác nhận đặt phòng"}
              </button>
            </div>
          </form>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn đặt</h2>
              <div className="divide-y divide-gray-200">
                <div className="py-3 flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {localRoomTitle || "Phòng đang chọn"}
                    </p>
                    <p className="text-sm text-gray-500">Đặt cọc/Thanh toán</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {totalAmount.toLocaleString()} vnđ
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{totalAmount.toLocaleString()} vnđ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí dịch vụ:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-teal-600">
                      {totalAmount.toLocaleString()} vnđ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ModalShell isOpen={showQRCode} onClose={() => setShowQRCode(false)}>
          <h3 className="text-lg font-semibold text-center mb-2">
            Quét mã để thanh toán
          </h3>
          <p className="text-sm text-gray-600 text-center">
            Ngân hàng: <strong>Techcombank (TCB)</strong>
            <br />
            Chủ TK: <strong>[TÊN CHỦ TÀI KHOẢN]</strong>
            <br />
            Số tiền:{" "}
            <strong className="text-red-600">
              {totalAmount.toLocaleString()} vnđ
            </strong>
          </p>
          <img
            src={qrCodeValue}
            alt="QR Code Thanh toán"
            className="w-64 h-64 mx-auto my-4"
          />
          <p className="text-center font-medium text-teal-700">
            Nội dung chuyển khoản:
            <br />
            <strong className="text-lg text-red-600 tracking-wider">
              {paymentCheckText}
            </strong>
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            (Vui lòng giữ nguyên nội dung chuyển khoản để được xác nhận tự động)
          </p>

          <CheckPayment
            totalMoney={totalAmount}
            txt={paymentCheckText}
            onPaymentSuccess={() => {
              setShowQRCode(false);
              toast.success("Đã ghi nhận thanh toán! Đang chờ Admin xác nhận.");
              navigate("/bookings");
            }}
          />
        </ModalShell>
      </div>
    </div>
  );
}
