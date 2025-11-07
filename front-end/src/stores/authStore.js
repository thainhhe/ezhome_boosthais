import { create } from "zustand";
import { authService } from "../services/authService";

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  loading: false,
  error: null,

  setToken: (token) => {
    localStorage.setItem("accessToken", token);
    set({ accessToken: token, isAuthenticated: true });
  },

  setUser: (user) => {
    set({ user });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(email, password);
      if (!data.accessToken) {
        throw new Error("Không nhận được access token từ server");
      }
      localStorage.setItem("accessToken", data.accessToken);
      if (data.user?.id) {
        localStorage.setItem("userId", data.user.id);
      }
      set({
        accessToken: data.accessToken,
        user: data.user,
        isAuthenticated: true,
        loading: false,
      });
      return { success: true, data };
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Đăng nhập thất bại";
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || `Lỗi ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response
        errorMessage = "Không thể kết nối đến server. Kiểm tra xem backend có đang chạy không?";
      } else {
        // Something else happened
        errorMessage = error.message || "Đăng nhập thất bại";
      }
      
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(email, password, name);
      set({ loading: false });
      return { success: true, data };
    } catch (error) {
      console.error("Register error:", error);
      let errorMessage = "Đăng ký thất bại";
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Lỗi ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến server. Kiểm tra xem backend có đang chạy không?";
      } else {
        errorMessage = error.message || "Đăng ký thất bại";
      }
      
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    }
  },

  loadProfile: async () => {
    set({ loading: true });
    try {
      const data = await authService.getProfile();
      set({ user: data.user, loading: false });
      return { success: true, data };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;

