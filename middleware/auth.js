const admin = require("../firebase");

const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).send("No token");
        }

        const decoded = await admin.auth().verifyIdToken(token);

        req.user = decoded; // contains uid
        next();
    } catch (error) {
        res.status(401).send("Unauthorized");
    }
};

module.exports = verifyUser;