import axios from "axios";

// Sử dụng proxy trong development, baseURL trong production
const isDevelopment = import.meta.env.DEV;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Đảm bảo API_URL không có trailing slash
// Ensure no trailing slash and strip a trailing '/api' if the env accidentally includes it
let cleanApiUrl = API_URL.replace(/\/+$/, "");
if (cleanApiUrl.endsWith("/api")) {
  console.warn(
    "VITE_API_URL contains '/api' - stripping it to use as backend host only."
  );
  cleanApiUrl = cleanApiUrl.replace(/\/api$/, "");
}

const api = axios.create({
  // Use the backend base URL for all environments so callers can pass full paths
  // (e.g. '/api/rooms' or '/users'). The frontend will call `${cleanApiUrl}${path}`.
  baseURL: cleanApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
});

// Interceptor để log requests (chỉ trong development)
if (isDevelopment) {
  api.interceptors.request.use(
    (config) => {
      console.log("🚀 API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL || ""}${config.url}`,
      });
      return config;
    },
    (error) => {
      console.error("❌ Request Error:", error);
      return Promise.reject(error);
    }
  );
}

// Interceptor để thêm token vào request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => {
    // Log success response (chỉ trong development)
    if (isDevelopment) {
      console.log("✅ API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    // Log error response (chỉ trong development)
    if (isDevelopment) {
      console.error("❌ API Error:", {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data,
        fullError: error,
      });
    }

    if (error.response?.status === 401) {
      // Token expired hoặc invalid
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }

    // Xử lý network error
    if (!error.response) {
      console.error("❌ Network Error - Backend không phản hồi:", {
        message: error.message,
        code: error.code,
        hint: "Kiểm tra xem backend có đang chạy không?",
      });
    }

    return Promise.reject(error);
  }
);

export default api;
