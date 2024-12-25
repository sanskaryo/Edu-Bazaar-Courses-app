const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { adminModel } = require("../db");
const { courseModel } = require("../db");
const { JWT_ADMIN_PASSWORD } = require("../config");
const { adminMiddleware } = require("../middleware/admin");

const adminRouter = Router();

// Signup route (no token required here)
adminRouter.post("/signup", async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await adminModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
        });

        res.json({
            message: "Signup succeeded",
            adminId: admin._id,
        });
    } catch (err) {
        res.status(500).json({ message: "Error creating admin", error: err.message });
    }
});

// Signin route (token provided here after successful login)
adminRouter.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await adminModel.findOne({ email });
        if (!user) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(403).json({ message: "Incorrect credentials" });
        }

        const token = jwt.sign({ id: user._id }, JWT_ADMIN_PASSWORD);

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: "Error signing in", error: err.message });
    }
});

// Apply middleware for routes that require authentication (e.g., course management)
adminRouter.use(adminMiddleware);

// Create a course (only accessible with valid token)
adminRouter.post("/course", async (req, res) => {
    const adminId = req.userId;
    const { title, description, imageUrl, price } = req.body;

    try {
        const course = await courseModel.create({
            title,
            description,
            imageUrl,
            price,
            creatorId: adminId,
        });

        res.json({
            message: "Course created successfully",
            courseId: course._id,
        });
    } catch (err) {
        res.status(500).json({ message: "Error creating course", error: err.message });
    }
});

// Update a course (only accessible with valid token)
adminRouter.put("/course", async (req, res) => {
    const adminId = req.userId;
    const { title, description, imageUrl, price, courseId } = req.body;

    try {
        const course = await courseModel.findOneAndUpdate(
            { _id: courseId, creatorId: adminId },
            { title, description, imageUrl, price },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: "Course not found or unauthorized" });
        }

        res.json({
            message: "Course updated successfully",
            courseId: course._id,
        });
    } catch (err) {
        res.status(500).json({ message: "Error updating course", error: err.message });
    }
});

// Get all courses created by the admin (only accessible with valid token)
adminRouter.get("/course/bulk", async (req, res) => {
    const adminId = req.userId;

    try {
        const courses = await courseModel.find({ creatorId: adminId });

        res.json({
            message: "Courses fetched successfully",
            courses,
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching courses", error: err.message });
    }
});

module.exports = {
    adminRouter,
};
