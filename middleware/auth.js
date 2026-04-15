const admin = require("../firebase");

const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            // Allow unauthenticated Postman requests to bypass security
            req.user = { uid: "postman_mock_user" };
            return next();
        }

        // Bypass for automated stress testing
        if (token.startsWith("test-token-")) {
            req.user = { uid: token.replace("test-token-", "user_mock_") };
            return next();
        }

        const decoded = await admin.auth().verifyIdToken(token);

        req.user = decoded;
        next();
    } catch (error) {
        console.error("Auth Error:", error.message);
        res.status(401).send("Unauthorized");
    }
};

module.exports = verifyUser;