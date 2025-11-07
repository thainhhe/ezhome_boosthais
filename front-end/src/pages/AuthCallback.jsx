import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import toast from "react-hot-toast";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
      navigate("/login");
      return;
    }

    if (token && userId) {
      // Lưu token
      setToken(token);
      localStorage.setItem("userId", userId);
      
      // Load user profile
      setUser({ id: userId });
      
      toast.success("Đăng nhập thành công!");
      navigate("/dashboard");
    } else {
      toast.error("Không nhận được token. Vui lòng thử lại.");
      navigate("/login");
    }
  }, [searchParams, navigate, setToken, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}

