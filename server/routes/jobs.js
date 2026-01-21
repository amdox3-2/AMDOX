const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Employer = require('../models/Employer');

// Create a new job
router.post('/', async (req, res) => {
    try {
        const { employer, title, description, qualifications, responsibilities, location, salaryRange, jobType } = req.body;

        const newJob = new Job({
            employer,
            title,
            description,
            qualifications,
            responsibilities,
            location,
            salaryRange,
            jobType
        });

        await newJob.save();
        res.status(201).json({ success: true, data: newJob });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get all jobs (with optional search/filters)
router.get('/', async (req, res) => {
    try {
        const { search, location, type, employerId } = req.query;
        let query = { status: 'Open' };

        if (employerId) {
            query.employer = employerId;
            delete query.status; // Employers want to see all their jobs
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (type) {
            query.jobType = type;
        }

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single job details
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Get employer details (company name)
        const employerProfile = await Employer.findOne({ userId: job.employer });

        res.json({
            success: true,
            data: {
                ...job._doc,
                companyName: employerProfile ? employerProfile.companyName : 'Unknown Company'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update a job
router.put('/:id', async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        res.json({ success: true, data: job });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete a job
router.delete('/:id', async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
