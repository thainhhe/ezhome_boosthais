const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const connectDB = require("./config/db");
const { swaggerSetup } = require("./config/swagger");
const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth.routes");
const protectedRoutes = require("./routes/protected.routes");
const testRoutes = require("./routes/test.routes");
const roomRoutes = require("./routes/room.routes");
const bookingRoutes = require("./routes/booking.routes");
const homeRoutes = require("./routes/home.routes");
const locationRoutes = require("./routes/location.routes");
const errorHandler = require("./utils/errorHandler");

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "MONGODB_URI",
];

const optionalEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",
  "FRONTEND_URL",
  "FRONTEND_URL_PROD",
  "FRONTEND_URL_DEV",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  console.error("Please check your .env file");
  process.exit(1);
}

const missingOptionalEnvVars = optionalEnvVars.filter(
  (varName) => !process.env[varName]
);
if (missingOptionalEnvVars.length > 0) {
  console.warn(
    `⚠️  Missing optional environment variables (Google OAuth may not work): ${missingOptionalEnvVars.join(
      ", "
    )}`
  );
}

const app = express();
const port = process.env.PORT || 5000;

// Cấu hình CORS động dựa trên môi trường
const corsOptions = {
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  origin: (origin, callback) => {
    if (process.env.NODE_ENV === "production") {
      const allowedOrigins = process.env.FRONTEND_URL_PROD
        ? process.env.FRONTEND_URL_PROD.split(",").map((url) => url.trim())
        : ["https://ezhome.com", "https://www.ezhome.com"];

      if (!origin) {
        // Same-origin request (không có origin header)
        callback(null, true);
      } else if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    } else {
      // Development: chấp nhận localhost hoặc tất cả
      const devOrigins = process.env.FRONTEND_URL_DEV
        ? [
            process.env.FRONTEND_URL_DEV,
            "http://localhost:3000",
            "http://localhost:5000",
          ]
        : ["http://localhost:3000", "http://localhost:5173"];

      if (
        !origin ||
        devOrigins.includes(origin) ||
        origin.includes("localhost")
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

swaggerSetup(app);

connectDB();

app.use("/api", indexRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/test", testRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/home", homeRoutes);
// server-side proxy for provinces/districts to avoid CORS issues from browser
app.use("/api/locations", locationRoutes);

app.use(errorHandler);

app.listen(port, () => console.log(`Server running on port ${port}`));
