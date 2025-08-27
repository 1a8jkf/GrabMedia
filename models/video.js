const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    video: { type: String, required: true },
    ip_address: { type: String, required: true },
    videoData: {
        data: Buffer,
        contentType: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
