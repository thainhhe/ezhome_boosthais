import api from "./api";

const bookingService = {
  // create a booking for a room. backend accepts roomId plus contact/payment data
  createBooking: async ({ roomId, name, phone, paymentMethod, notes }) => {
    const payload = { roomId };
    if (name !== undefined) payload.name = name;
    if (phone !== undefined) payload.phone = phone;
    if (paymentMethod !== undefined) payload.paymentMethod = paymentMethod;
    if (notes !== undefined) payload.notes = notes;
    const res = await api.post(`/api/bookings`, payload);
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
