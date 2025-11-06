import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import indexRoutes from "./routes/index.js";
import errorHandler from "./utils/errorHandler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

connectDB();

app.use("/", indexRoutes);

app.use(errorHandler);

app.listen(port, () => console.log(`Server running on port ${port}`));
