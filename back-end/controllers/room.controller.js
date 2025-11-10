const Room = require("../models/room.model");
const cloudinary = require("../config/cloudinary");

const roomController = {
  getAllRooms: async (req, res) => {
    try {
      // Ví dụ URL: GET /api/rooms?city=Hà Nội&district=Cầu Giấy&minPrice=2000000&maxPrice=4000000
      const { city, district, minPrice, maxPrice } = req.query;

      const filter = {};

      if (city) {
        filter["address.city"] = city;
      }

      if (district) {
        filter["address.district"] = district;
      }

      if (minPrice || maxPrice) {
        filter.rentPrice = {};
        if (minPrice) {
          filter.rentPrice.$gte = parseFloat(minPrice);
        }
        if (maxPrice) {
          filter.rentPrice.$lte = parseFloat(maxPrice);
        }
      }

      const rooms = await Room.find(filter).sort({ createdAt: -1 });
      res.json(rooms);
    } catch (error) {
      console.error("Get all rooms error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getRoomById: async (req, res) => {
    try {
      const mongoose = require("mongoose");
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid room ID format" });
      }

      const room = await Room.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      console.error("Get room by id error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  createRoom: async (req, res) => {
    try {
      const {
        title,
        description,
        rentPrice,
        area,
        link360,
        city,
        district,
        street,
        furnitureDetails,
        electricityCost,
        waterCost,
        wifiCost,
        parkingCost,
      } = req.body;

      if (!title || !rentPrice || !area || !city || !district || !street) {
        return res.status(400).json({
          message: "Title, rentPrice, area, city, district, and street are required",
        });
      }

      const images = [];
      const videos = [];

      if (req.files?.images) {
        req.files.images.forEach((file) => {
          images.push({
            url: file.path,
            public_id: file.filename,
          });
        });
      }

      if (req.files?.videos) {
        req.files.videos.forEach((file) => {
          videos.push({
            url: file.path,
            public_id: file.filename,
          });
        });
      }

      const room = new Room({
        title,
        description,
        rentPrice: parseFloat(rentPrice),
        area: parseFloat(area),
        media: {
          images,
          videos,
          link360: link360 || "",
        },
        address: {
          city,
          district,
          street,
        },
        utilities: {
          furnitureDetails: furnitureDetails || "",
          electricityCost: parseFloat(electricityCost) || 0,
          waterCost: parseFloat(waterCost) || 0,
          wifiCost: parseFloat(wifiCost) || 0,
          parkingCost: parseFloat(parkingCost) || 0,
        },
      });

      await room.save();

      res.status(201).json({
        message: "Room created successfully",
        room,
      });
    } catch (error) {
      console.error("Create room error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  updateRoom: async (req, res) => {
    try {
      const {
        title,
        description,
        rentPrice,
        area,
        link360,
        city,
        district,
        street,
        furnitureDetails,
        electricityCost,
        waterCost,
        wifiCost,
        parkingCost,
      } = req.body;

      const updateData = {};

      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (rentPrice) updateData.rentPrice = parseFloat(rentPrice);
      if (area) updateData.area = parseFloat(area);
      if (link360 !== undefined) {
        updateData["media.link360"] = link360;
      }
      if (city) updateData["address.city"] = city;
      if (district) updateData["address.district"] = district;
      if (street) updateData["address.street"] = street;
      if (furnitureDetails !== undefined)
        updateData["utilities.furnitureDetails"] = furnitureDetails;
      if (electricityCost !== undefined)
        updateData["utilities.electricityCost"] = parseFloat(electricityCost);
      if (waterCost !== undefined)
        updateData["utilities.waterCost"] = parseFloat(waterCost);
      if (wifiCost !== undefined)
        updateData["utilities.wifiCost"] = parseFloat(wifiCost);
      if (parkingCost !== undefined)
        updateData["utilities.parkingCost"] = parseFloat(parkingCost);

      const room = await Room.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      res.json({
        message: "Room updated successfully",
        room,
      });
    } catch (error) {
      console.error("Update room error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  deleteRoom: async (req, res) => {
    try {
      const room = await Room.findById(req.params.id);

      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const deletePromises = [];

      if (room.media?.images && room.media.images.length > 0) {
        room.media.images.forEach((image) => {
          deletePromises.push(
            cloudinary.uploader.destroy(image.public_id, {
              resource_type: "image",
            })
          );
        });
      }

      if (room.media?.videos && room.media.videos.length > 0) {
        room.media.videos.forEach((video) => {
          deletePromises.push(
            cloudinary.uploader.destroy(video.public_id, {
              resource_type: "video",
            })
          );
        });
      }

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }

      await Room.findByIdAndDelete(req.params.id);

      res.json({ message: "Room deleted successfully" });
    } catch (error) {
      console.error("Delete room error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = roomController;

