import api from "./api";

export const authService = {
  register: async (email, password, name) => {
    const response = await api.post("/api/auth/register", {
      email,
      password,
      name,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post("/api/auth/refresh-token");
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/api/auth/logout");
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/api/profile");
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get("/api/dashboard");
    return response.data;
  },
};

