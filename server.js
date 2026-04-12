const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is LIVE 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


const mongoose = require("mongoose");
require("dotenv").config();


if (process.env.MONGO_URI) {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB connected 🚀"))
        .catch((err) => console.log(err));
} else {
    console.warn("WARNING: MONGO_URI is not defined. MongoDB will not be connected.");
}


const Campaign = require("./models/Campaign");

app.get("/test-campaign", async (req, res) => {
    try {
        const newCampaign = await Campaign.create({
            title: "Test Campaign",
            limit: 5,
            startTime: new Date(),
        });

        res.send(newCampaign);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.post("/create-campaign", async (req, res) => {
    try {
        const { title, limit, startTime } = req.body;

        if (!title || !limit || !startTime) {
            return res.status(400).send("All fields are required");
        }

        const campaign = await Campaign.create({
            title,
            limit,
            startTime,
        });

        res.send({
            message: "Campaign created successfully",
            campaign,
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.get("/active-campaign", async (req, res) => {
    try {
        const currentTime = new Date(); // ✅ FIX

        const campaign = await Campaign.findOne({
            startTime: { $lte: currentTime },
        }).sort({ startTime: -1 });

        if (!campaign) {
            return res.send("No active campaign");
        }

        res.send(campaign);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


const verifyUser = require("./middleware/auth");

app.post("/claim", verifyUser, async (req, res) => {
    try {
        const campaignId = req.body.campaignId;
        const userId = req.user.uid; // ✅ real user

        const campaign = await Campaign.findById(campaignId);

        if (!campaign) {
            return res.status(404).send("Campaign not found");
        }

        if (new Date() < new Date(campaign.startTime)) {
            return res.status(400).send("Campaign not started yet");
        }

        if (campaign.claimedUsers.includes(userId)) {
            return res.status(400).send("Already claimed");
        }

        if (campaign.claimed >= campaign.limit) {
            return res.status(400).send("Sold Out");
        }

        campaign.claimed += 1;
        campaign.claimedUsers.push(userId);

        await campaign.save();

        res.send("Claim successful 🎉");
    } catch (error) {
        res.status(500).send(error.message);
    }
});


const multer = require("multer");
const cloudinary = require("./cloudinary");

const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const streamifier = require("streamifier");

        const stream = cloudinary.uploader.upload_stream(
            { folder: "viral-drop" },
            (error, result) => {
                if (error) {
                    return res.status(500).send(error.message);
                }
                res.send({ imageUrl: result.secure_url });
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


