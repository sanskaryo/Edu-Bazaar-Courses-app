const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");

function adminMiddleware(req, res, next) {
    const token = req.headers.token;

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            message: "Authorization token is missing"
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_ADMIN_PASSWORD);
        req.userId = decoded.id; // Attach user ID to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // Handle errors during token verification
        res.status(403).json({
            message: "Invalid or expired token"
        });
    }
}

module.exports = {
    adminMiddleware
};
