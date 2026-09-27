// ==========================================
// DNS FIX FOR MONGODB SRV LOOKUP
// ==========================================
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// ==========================================
// DEPENDENCIES
// ==========================================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

// ==========================================
// 1. MIDDLEWARE SETUP
// ==========================================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ==========================================
// 2. MONGODB ATLAS CONNECTION
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set in .env — exiting.");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas: barangay_db"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// ==========================================
// 3. USER SCHEMA & MODEL
// ==========================================
const userSchema = new mongoose.Schema(
  {
    first_name: { type: String },
    middle_name: { type: String, default: "" },
    last_name: { type: String },
    firstName: { type: String },
    middleName: { type: String, default: "" },
    lastName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff", "resident"], default: "staff" },
    contact_number: { type: String, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const User = mongoose.model("User", userSchema, "users");

// ==========================================
// 4. API ROUTES
// ==========================================

app.get("/", (req, res) => {
  res.send("Barangay Portal API is running...");
});

// REGISTER ROUTE
app.post("/api/register", async (req, res) => {
  try {
    const { first_name, firstName, middle_name, middleName, last_name, lastName, email, password, contact_number } = req.body;

    const fName = first_name || firstName;
    const lName = last_name || lastName;
    const mName = middle_name || middleName || "";

    if (!fName || !lName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and password are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      first_name: fName,
      middle_name: mName,
      last_name: lName,
      email: cleanEmail,
      password: hashedPassword,
      role: "staff",
      contact_number: contact_number || null,
      status: "active",
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user_id: newUser._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred during registration.",
    });
  }
});

// LOGIN ROUTE
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email and password.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        id: user._id,
        _id: user._id,
        email: user.email,
        first_name: user.first_name || user.firstName || "",
        middle_name: user.middle_name || user.middleName || "",
        last_name: user.last_name || user.lastName || "",
        role: user.role || "staff",
        status: user.status || "active",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred during login.",
    });
  }
});

// ==========================================
// 5. SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});