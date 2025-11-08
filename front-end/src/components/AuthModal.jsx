import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../stores/authStore";
import { testBackendConnection } from "../utils/testConnection";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>,
    document.body
  );
}

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const [isRegister, setIsRegister] = useState(initialMode === "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [backendConnected, setBackendConnected] = useState(null);

  const navigate = useNavigate();

  const { login, register, loading, error, clearError, loadProfile } =
    useAuthStore();

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setName("");
      setIsRegister(false);
      clearError && clearError();
    } else {
      // when opening, initialize mode based on prop
      setIsRegister(initialMode === "register");
    }
  }, [isOpen, clearError, initialMode]);

  // Test connection when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const check = async () => {
      const ok = await testBackendConnection();
      setBackendConnected(ok);
      if (!ok) {
        toast.error(
          "Không thể kết nối đến backend. Kiểm tra xem backend có đang chạy không?",
          { duration: 5000 }
        );
      }
    };
    check();
  }, [isOpen]);

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    let cleanUrl = backendUrl.replace(/\/+$/, "");
    // if user put /api in VITE_API_URL, strip it to avoid double '/api/api'
    if (cleanUrl.endsWith("/api")) cleanUrl = cleanUrl.replace(/\/api$/, "");
    window.location.href = `${cleanUrl}/api/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError && clearError();

    if (isRegister) {
      const result = await register(email, password, name);
      if (result.success) {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsRegister(false);
        setEmail("");
        setPassword("");
        setName("");
      } else {
        toast.error(result.error || "Đăng ký thất bại");
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        toast.success("Đăng nhập thành công!");
        onClose();
        // Ensure we have full profile (role) before redirecting
        try {
          const profileRes = await loadProfile();
          const role = profileRes?.data?.user?.role || profileRes?.user?.role;
          if (role === "admin") navigate("/admin");
          else navigate("/");
        } catch (e) {
          // fallback to home
          navigate("/");
        }
      } else {
        toast.error(result.error || "Đăng nhập thất bại");
      }
    }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose}>
      <div className="min-w-0">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {isRegister ? "Đăng ký" : "Đăng nhập"}
          </h3>
          <p className="text-sm text-gray-600">
            {isRegister ? "Tạo tài khoản mới" : "Chào mừng trở lại"}
          </p>
          {backendConnected === false && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Backend không kết nối được. Đảm bảo backend đang chạy ở port
                5000.
              </p>
            </div>
          )}
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full mb-4 flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Đăng nhập với Google
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">hoặc</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Họ tên
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                placeholder="Nhập họ tên"
                required={isRegister}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              placeholder="Nhập email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 text-white py-3 rounded-lg font-medium hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : isRegister ? "Đăng ký" : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              clearError && clearError();
              setEmail("");
              setPassword("");
              setName("");
            }}
            className="text-teal-700 hover:text-teal-800 font-medium"
          >
            {isRegister
              ? "Đã có tài khoản? Đăng nhập"
              : "Chưa có tài khoản? Đăng ký"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
