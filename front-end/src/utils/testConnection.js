// Utility để test kết nối với backend
export const testBackendConnection = async () => {
  try {
    // Dùng biến môi trường để support cả localhost và production
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const cleanUrl = backendUrl.replace(/\/api$/i, "").replace(/\/+$/, "");
    const response = await fetch(`${cleanUrl}/health`);
    if (response.ok) {
      console.log("✅ Backend đang chạy!");
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ Backend không kết nối được:", error);
    return false;
  }
};

// Test API endpoint
export const testApiEndpoint = async (endpoint) => {
  try {
    const response = await fetch(`http://localhost:5000${endpoint}`);
    return {
      success: response.ok,
      status: response.status,
      data: await response.json().catch(() => null),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

