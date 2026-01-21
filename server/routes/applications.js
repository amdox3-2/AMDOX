const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const Seeker = require('../models/Seeker');

// Apply for a job
router.post('/', async (req, res) => {
    try {
        const { jobId, seekerId, coverLetter, resumeSnapshot } = req.body;

        // Check if job exists and is open
        const job = await Job.findById(jobId);
        if (!job || job.status !== 'Open') {
            return res.status(400).json({ success: false, message: 'Job is not available for applications' });
        }

        const application = new Application({
            job: jobId,
            seeker: seekerId,
            coverLetter,
            resumeSnapshot
        });

        await application.save();
        res.status(201).json({ success: true, data: application });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get applications for a seeker
router.get('/seeker/:seekerId', async (req, res) => {
    try {
        const applications = await Application.find({ seeker: req.params.seekerId })
            .populate('job', 'title location companyName')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get applications for an employer's job
router.get('/job/:jobId', async (req, res) => {
    try {
        const applications = await Application.find({ job: req.params.jobId })
            .sort({ createdAt: -1 });

        // Enhance with seeker details manually to avoid deep populate issues or if Seeker model is separate
        const enhancedApps = await Promise.all(applications.map(async (app) => {
            const seekerProfile = await Seeker.findOne({ userId: app.seeker });
            return {
                ...app._doc,
                seekerProfile
            };
        }));

        res.json({ success: true, data: enhancedApps });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update application status (Employer action)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.json({ success: true, data: application });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
