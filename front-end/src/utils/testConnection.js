// Utility để test kết nối với backend
export const testBackendConnection = async () => {
  try {
    const response = await fetch("http://localhost:5000/api-docs.json");
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

