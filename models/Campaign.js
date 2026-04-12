const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    limit: {
        type: Number,
        required: true,
    },
    claimed: {
        type: Number,
        default: 0,
    },
    startTime: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

    claimedUsers: {
        type: [String],
        default: [],
    },

});

module.exports = mongoose.model("Campaign", campaignSchema);


