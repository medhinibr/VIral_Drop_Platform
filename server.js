const cluster = require("cluster");
const os = require("os");
// === SCALABILITY TRICK: LAUNCH A CLUSTER OF SERVERS (1 PER CPU CORE) ===
if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    console.log(`\n🚀 Primary Master (PID: ${process.pid}) dynamically scaling backend...`);
    console.log(`🧠 Detected ${numCPUs} CPU Cores. Spinning up ${numCPUs} independent Node.js workers!\n`);

    // Spawn a worker thread for each CPU core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Auto-restart workers if they crash
    cluster.on("exit", (worker, code, signal) => {
        console.log(`⚠️ Worker ${worker.process.pid} dropped. Spinning up a replacement immediately!`);
        cluster.fork();
    });

} else {
    // === INDIVIDUAL WORKER NODE LOGIC ===

    const express = require("express");
    const cors = require("cors");

    const app = express();

    app.use(cors());
    app.use(express.json());

    // Removed temporary root route to allow React's index.html to serve at /

    // Render assigns external ports dynamically
    const PORT = process.env.PORT || 10000;

    // Binding to 0.0.0.0 ensures it runs publicly, not on localhost
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ [Worker ${process.pid}] successfully live & processing requests on port ${PORT}`);
    });


    const mongoose = require("mongoose");
    require("dotenv").config();


    if (process.env.MONGO_URI) {
        mongoose
            .connect(process.env.MONGO_URI, {
                // MongoDB Connection Pooling scaling
                maxPoolSize: 250, // Allow 250 simultaneous operations per worker 
                minPoolSize: 20   // Keep connections warm
            })
            .then(() => console.log(`[Worker ${process.pid}] Database connected 🚀`))
            .catch((err) => console.log(err));
    } else {
        console.warn("WARNING: MONGO_URI is not defined. MongoDB will not be connected.");
    }


    const Campaign = require("./models/Campaign");
    const verifyUser = require("./middleware/auth");

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


    app.post("/create-campaign", verifyUser, async (req, res) => {
        try {
            const { title, limit, startTime, eventDate } = req.body;

            if (!title || !limit || !startTime || !eventDate) {
                return res.status(400).send("All fields are required");
            }

            const campaign = await Campaign.create({
                title,
                limit,
                startTime,
                eventDate,
                createdBy: req.user.uid,
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
            // Return all campaigns so they are reflected in the frontend 
            const campaigns = await Campaign.find({}).sort({ startTime: -1 });

            res.json(campaigns);
        } catch (error) {
            res.status(500).send(error.message);
        }
    });



    app.post("/claim", verifyUser, async (req, res) => {
        try {
            const { campaignId, userName } = req.body;
            const userId = req.user.uid; // ✅ real user

            const campaign = await Campaign.findOneAndUpdate(
                {
                    _id: campaignId,
                    $expr: { $lt: ["$claimed", "$limit"] },
                    startTime: { $lte: new Date() }
                },
                {
                    $inc: { claimed: 1 },
                    $push: { claimedUsers: `${userId}|${userName || 'Collector'}` }
                },
                { returnDocument: 'after' } // Upgraded from deprecated `new: true` to prevent console.warn bottlenecks during stress
            );

            if (!campaign) {
                // Fallback validation mapping to return the exact deterministic reason for transaction failure
                const checkCampaign = await Campaign.findById(campaignId);
                if (!checkCampaign) {
                    return res.status(404).send("Campaign not found");
                }
                if (new Date() < new Date(checkCampaign.startTime)) {
                    return res.status(400).send("Campaign not started yet");
                }
                if (checkCampaign.claimed >= checkCampaign.limit) {
                    return res.status(400).send("Sold Out");
                }
                return res.status(400).send("Reservation transaction failed due to scale contention.");
            }

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

    // Serve Frontend statically from the backend
    const path = require("path");

    app.use(express.static(path.join(__dirname, "frontend", "dist")));

    // Catch-all route for React Router (Express 5 Safe)
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
    });

} // <--- END OF SCALABLE CLUSTER WORKER BLOCK


