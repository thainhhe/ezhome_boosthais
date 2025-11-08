import api from "./api";

// Admin-specific API helpers
export const adminService = {
  // Users
  getUsers: async () => {
    const res = await api.get("/users");
    return res.data;
  },

  getUserById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  createUser: async (payload) => {
    const res = await api.post(`/users`, payload);
    return res.data;
  },

  updateUser: async (id, payload) => {
    const res = await api.put(`/users/${id}`, payload);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  // Bookings (admin)
  getAllBookings: async () => {
    const res = await api.get(`/api/bookings/all`);
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
