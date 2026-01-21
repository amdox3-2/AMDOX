const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Employer = require('./models/Employer');
const Seeker = require('./models/Seeker');
const Job = require('./models/Job');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Employer.deleteMany({});
        await Seeker.deleteMany({});
        await Job.deleteMany({});
        console.log('Cleared existing data.');

        // Create Employers
        const employersData = [
            {
                name: 'TechCorp Solutions',
                email: 'hr@techcorp.com',
                password: 'password123',
                role: 'employer',
                companyName: 'TechCorp Solutions',
                website: 'https://techcorp.com',
                phone: '123-456-7890',
                address: '123 Silicon Valley, CA',
                description: 'Leading technology solutions provider specializing in cloud and AI.'
            },
            {
                name: 'Creative Designs Inc.',
                email: 'jobs@creativedesigns.com',
                password: 'password123',
                role: 'employer',
                companyName: 'Creative Designs Inc.',
                website: 'https://creativedesigns.io',
                phone: '098-765-4321',
                address: '456 Design District, NY',
                description: 'Digital agency focused on creating beautiful user experiences.'
            },
            {
                name: 'Green Energy Co.',
                email: 'careers@greenenergy.org',
                password: 'password123',
                role: 'employer',
                companyName: 'Green Energy Co.',
                website: 'https://greenenergy.org',
                phone: '555-012-3456',
                address: '789 Eco Park, TX',
                description: 'Renewable energy company committed to a sustainable future.'
            }
        ];

        const createdEmployers = [];
        for (const data of employersData) {
            const user = new User({
                name: data.name,
                email: data.email,
                password: data.password, // Schema pre-save will hash this
                role: data.role
            });
            await user.save();

            const employer = new Employer({
                userId: user._id,
                companyName: data.companyName,
                website: data.website,
                contactEmail: data.email,
                phone: data.phone,
                address: data.address,
                description: data.description
            });
            await employer.save();
            createdEmployers.push(user);
        }
        console.log('Created 3 Employers.');

        // Create Seekers
        const seekersData = [
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'password123',
                role: 'seeker',
                phone: '111-222-3333',
                address: '101 Maple St, Anytown, USA',
                skills: 'JavaScript, React, Node.js, MongoDB, Express'
            },
            {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                password: 'password123',
                role: 'seeker',
                phone: '444-555-6666',
                address: '202 Oak Ave, Somecity, USA',
                skills: 'UI/UX Design, Figma, Adobe XD, CSS, HTML'
            },
            {
                name: 'Alex Rivera',
                email: 'alex.r@example.com',
                password: 'password123',
                role: 'seeker',
                phone: '777-888-9999',
                address: '303 Pine Rd, Othercity, USA',
                skills: 'Python, Data Science, SQL, Machine Learning'
            }
        ];

        for (const data of seekersData) {
            const user = new User({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role
            });
            await user.save();

            const seeker = new Seeker({
                userId: user._id,
                fullName: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                skills: data.skills
            });
            await seeker.save();
        }
        console.log('Created 3 Seekers.');

        // Create Jobs
        const jobsData = [
            {
                employer: createdEmployers[0]._id, // TechCorp
                title: 'Senior Full Stack Developer',
                description: 'Looking for an experienced developer to join our AI team.',
                qualifications: '5+ years experience with React and Node.js.',
                responsibilities: 'Develop and maintain scalable web applications.',
                location: 'San Francisco, CA (Hybrid)',
                salaryRange: '$120k - $160k',
                jobType: 'Full-time'
            },
            {
                employer: createdEmployers[0]._id, // TechCorp
                title: 'DevOps Engineer',
                description: 'Manage our AWS infrastructure and CI/CD pipelines.',
                qualifications: 'Experience with Docker, Kubernetes, and Terraform.',
                responsibilities: 'Ensure high availability and security of services.',
                location: 'Remote',
                salaryRange: '$110k - $140k',
                jobType: 'Remote'
            },
            {
                employer: createdEmployers[0]._id, // TechCorp
                title: 'AI Research Scientist',
                description: 'Explore the boundaries of Large Language Models and Generative AI.',
                qualifications: 'Ph.D. in CS or related field, experience with PyTorch/TensorFlow.',
                responsibilities: 'Conduct original research and publish findings.',
                location: 'Palo Alto, CA',
                salaryRange: '$180k - $250k',
                jobType: 'Full-time'
            },
            {
                employer: createdEmployers[1]._id, // Creative Designs
                title: 'Product Designer',
                description: 'Shape the future of our clients digital products.',
                qualifications: 'Strong portfolio showcasing mobile and web design.',
                responsibilities: 'Conduct user research and create high-fidelity prototypes.',
                location: 'New York, NY',
                salaryRange: '$90k - $130k',
                jobType: 'Full-time'
            },
            {
                employer: createdEmployers[1]._id, // Creative Designs
                title: 'Lead Graphic Designer',
                description: 'Lead our creative team in developing brand identities for global clients.',
                qualifications: '7+ years experience in agency environment.',
                responsibilities: 'Mentor junior designers and lead client presentations.',
                location: 'New York, NY',
                salaryRange: '$110k - $150k',
                jobType: 'Full-time'
            },
            {
                employer: createdEmployers[2]._id, // Green Energy
                title: 'Data Analyst',
                description: 'Analyze energy consumption data to optimize distribution.',
                qualifications: 'Proficiency in Python and SQL.',
                responsibilities: 'Build dashboards and generate insights for stakeholders.',
                location: 'Austin, TX',
                salaryRange: '$80k - $105k',
                jobType: 'Full-time'
            },
            {
                employer: createdEmployers[2]._id, // Green Energy
                title: 'Environmental Consultant',
                description: 'Help companies reduce their carbon footprint.',
                qualifications: 'Degree in Environmental Science or related field.',
                responsibilities: 'Conduct audits and provide strategic recommendations.',
                location: 'Seattle, WA',
                salaryRange: '$70k - $95k',
                jobType: 'Contract'
            },
            {
                employer: createdEmployers[2]._id, // Green Energy
                title: 'Solar Project Manager',
                description: 'Manage large-scale solar installation projects from inception to completion.',
                qualifications: 'PMP certification, experience in renewable energy sector.',
                responsibilities: 'Resource planning, budgeting, and onsite supervision.',
                location: 'Phoenix, AZ',
                salaryRange: '$95k - $130k',
                jobType: 'Full-time'
            }
        ];

        for (const data of jobsData) {
            const job = new Job(data);
            await job.save();
        }
        console.log(`Created ${jobsData.length} Jobs.`);

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
