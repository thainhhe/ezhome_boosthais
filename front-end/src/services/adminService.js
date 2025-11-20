import api from "./api";

// Admin-specific API helpers
export const adminService = {
  // Users
  getUsers: async () => {
    // backend mounts user routes under /api (see back-end/server.js)
    const res = await api.get("/api/users");
    return res.data;
  },

  getUserById: async (id) => {
    const res = await api.get(`/api/users/${id}`);
    return res.data;
  },

  createUser: async (payload) => {
    const res = await api.post(`/api/users`, payload);
    return res.data;
  },

  updateUser: async (id, payload) => {
    const res = await api.put(`/api/users/${id}`, payload);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/api/users/${id}`);
    return res.data;
  },

  // Bookings (admin)
  getAllBookings: async (params) => {
    const res = await api.get(`/api/bookings/all`, { params });
    return res.data;
  },

  updateBookingStatus: async (id, status) => {
    const res = await api.put(`/api/bookings/status/${id}`, { status });
    return res.data;
  },

  // Rooms (basic admin helpers)
  getRooms: async (params) => {
    const res = await api.get(`/api/rooms`, { params });
    return res.data;
  },
};

export default adminService;

// Room CRUD (multipart/form-data)
export const createRoom = async (formData) => {
  // formData should be a FormData instance
  const res = await api.post(`/api/rooms`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateRoom = async (id, formData) => {
  // If using multipart for update, backend expects JSON for some flows; we support formData
  const res = await api.put(`/api/rooms/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteRoom = async (id) => {
  const res = await api.delete(`/api/rooms/${id}`);
  return res.data;
};

// Get single room by id
export const getRoomById = async (id) => {
  const res = await api.get(`/api/rooms/${id}`);
  return res.data;
};
