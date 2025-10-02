import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection (Atlas testDB)
mongoose.connect("mongodb+srv://ushansulakshana81_db_user:Ushan%402002@cluster0.h9ewddx.mongodb.net/testDB")
  .then(() => console.log("MongoDB connected to Atlas testDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// User schema (mapped to 'users' collection)
const userSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  homeTown: { type: String },
  mobile: { type: String },
  nic: { type: String },
  designation: { type: String },
  role: { type: String },
  username: { type: String },
  status: { type: String },
  createdDate: { type: Date },
  password: { type: String, required: true },
  employeeNumber: { type: String, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { collection: "users" }); // force schema to use "users" collection

const User = mongoose.model("User", userSchema);

// Role schema (mapped to 'roles' collection)
const roleSchema = new mongoose.Schema({
  roleID: { type: String, required: true, unique: true },
  roleName: { type: String, required: true },
  description: { type: String },
}, { collection: "roles" });

const Role = mongoose.model("Role", roleSchema);

// 🔹 Seed default roles if not present
const seedRoles = async () => {
  try {
    const defaultRoles = [
      { roleID: "R001", roleName: "Admin", description: "full control over the system" },
      { roleID: "R002", roleName: "Cashier", description: "cart control" },
      { roleID: "R003", roleName: "Purchase Officer", description: "purchasing controls" },
      { roleID: "R004", roleName: "Vehicle Manager", description: "vehicle manager controls" },
      { roleID: "R005", roleName: "Other", description: "no specified controls" },
    ];
    
    for (const role of defaultRoles) {
      const exists = await Role.findOne({ roleID: role.roleID });
      if (!exists) {
        await Role.create(role);
        console.log(`✅ Created role: ${role.roleName}`);
      }
    }
  } catch (err) {
    console.error("Error seeding roles:", err);
  }
};

// 🔥 Call seeding function when server starts
seedRoles();

// Create user route
app.post("/create-user", async (req, res) => {
  try {
    console.log("Incoming data:", req.body);
    const { firstName, lastName, email, homeTown, mobile, nic, designation, roleID, password } = req.body;

    // Lookup role by roleID
    const role = await Role.findOne({ roleID });
    if (!role) {
      return res.status(400).json({ error: "Invalid roleID" });
    }

    // Generate username by concatenating firstName and lastName with first letter capitalized
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    const username =
      capitalize(firstName) +
      (lastName.length > 0 ? capitalize(lastName.slice(0, 2)) : "");

    // ✅ Generate a unique employee number
    const generateUniqueEmployeeNumber = async () => {
      let unique = false;
      let employeeNumber;

      // ✅ Generate next sequential employee number
      const lastUser = await User.findOne({}, { employeeNumber: 1 })
        .sort({ employeeNumber: -1 }) // find highest employeeNumber
        .lean();

        if (lastUser && lastUser.employeeNumber) {
          const lastNum = parseInt(lastUser.employeeNumber.replace("HS", ""), 10);
          employeeNumber = "HS" + String(lastNum + 1).padStart(4, "0");
        } else {
          employeeNumber = "HS0001"; // start from HS0001 if no users
      }

      return employeeNumber;
    };

    const employeeNumber = await generateUniqueEmployeeNumber();
    console.log("Generated unique employee number:", employeeNumber);

    let createdBy = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
        createdBy = decoded.id;
      }
    } catch (err) {
      console.error("Error decoding token:", err);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      homeTown,
      mobile,
      nic,
      designation,
      role: role.roleID, 
      username,
      status: "active",
      createdDate: Date.now(),
      password: hashedPassword,
      employeeNumber,
      createdBy,
    });

    await newUser.save();
    console.log("Saved user with employee number:", newUser.employeeNumber);

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.json({ message: "User created successfully", user: userResponse });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Duplicate entry detected. Employee number or email already exists." });
    }
    console.error("Error in /create-user:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("firstName lastName email mobile nic designation role status username employeeNumber _id createdDate").lean();

    // Map roleID to roleName for each user
    const roleIDs = [...new Set(users.map(user => user.role))];
    const roles = await Role.find({ roleID: { $in: roleIDs } }).select("roleID roleName").lean();
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.roleID] = role.roleName;
    });

    const usersWithRoleName = users.map(user => ({
      ...user,
      role: roleMap[user.role] || user.role
    }));

    res.json(usersWithRoleName);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error fetching users" });
  }
});

// Get single user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    // Map roleID to roleName
    const role = await Role.findOne({ roleID: user.role }).select("roleName").lean();
    if (role) {
      user.role = role.roleName;
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single user by employee number
app.get("/users/employee/:employeeNumber", async (req, res) => {
  try {
    const user = await User.findOne({ employeeNumber: req.params.employeeNumber }).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    // Map roleID to roleName
    const role = await Role.findOne({ roleID: user.role }).select("roleName").lean();
    if (role) {
      user.role = role.roleName;
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user by employee number:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Terminate user (set status inactive)
app.patch("/users/:id/terminate", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User terminated successfully", user });
  } catch (err) {
    console.error("Error terminating user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user (edit details)
app.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user
app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Server error deleting user" });
  }
});

// Get all roles
app.get("/roles", async (req, res) => {
  try {
    const roles = await Role.find().select("roleID roleName -_id");
    res.json(roles);
  } catch (err) {
    console.error("Error fetching roles:", err);
    res.status(500).json({ error: "Server error fetching roles" });
  }
});


// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    //Check if inactive
    if(user.status === "inactive") {
      return res.status(403).json({ error: "Your account is inactive"});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        employeeNumber: user.employeeNumber,
      }
    });
  } catch (err) {
    console.error("Error in /login:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));