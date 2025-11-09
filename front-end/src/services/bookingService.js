import api from "./api";

const bookingService = {
  // create a booking for a room. backend currently expects { roomId }
  createBooking: async (roomId) => {
    const res = await api.post(`/api/bookings`, { roomId });
    return res.data;
  },

  // get bookings for current user
  getMyBookings: async () => {
    const res = await api.get(`/api/bookings/my-bookings`);
    return res.data;
  },

  // lightweight helper for admin uses exists in adminService
};

export default bookingService;
