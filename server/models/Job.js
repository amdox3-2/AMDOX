const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    qualifications: {
        type: String,
        required: true
    },
    responsibilities: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    salaryRange: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
        default: 'Full-time'
    },
    status: {
        type: String,
        enum: ['Open', 'Closed'],
        default: 'Open'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
