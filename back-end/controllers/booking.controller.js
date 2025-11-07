const Booking = require("../models/booking.model");
const Room = require("../models/room.model");

const bookingController = {
  createBooking: async (req, res) => {
    try {
      const { roomId } = req.body;

      if (!roomId) {
        return res.status(400).json({ message: "roomId is required" });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const booking = new Booking({
        user: req.user._id,
        room: roomId,
        totalAmount: room.rentPrice,
        status: "pending",
      });

      await booking.save();
      await booking.populate("room");

      res.status(201).json({
        message: "Booking created successfully",
        booking,
      });
    } catch (error) {
      console.error("Create booking error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getMyBookings: async (req, res) => {
    try {
      const bookings = await Booking.find({ user: req.user._id }).populate(
        "room"
      );

      res.json(bookings);
    } catch (error) {
      console.error("Get my bookings error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getAllBookings: async (req, res) => {
    try {
      const bookings = await Booking.find()
        .populate("user", "-password")
        .populate("room");

      res.json(bookings);
    } catch (error) {
      console.error("Get all bookings error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  updateBookingStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "status is required" });
      }

      if (!["pending", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({
          message: "status must be one of: pending, completed, cancelled",
        });
      }

      const booking = await Booking.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      )
        .populate("user", "-password")
        .populate("room");

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({
        message: "Booking status updated successfully",
        booking,
      });
    } catch (error) {
      console.error("Update booking status error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = bookingController;

