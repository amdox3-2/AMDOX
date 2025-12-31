# AMDOX - Job Portal

A full-stack job portal application with MongoDB database integration for managing job seekers and employers.

## Features

- User Authentication (Registration & Login)
- Job Seeker Profiles with resume upload
- Employer Profiles with company information
- Profile Listing Pages (Browse all registered users)
- MongoDB Database Integration
- RESTful API Backend

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **File Upload**: Multer

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB installation)
- npm or yarn

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Configure MongoDB

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Get your connection string
4. Create a `.env` file in the `server` directory:

```env
PORT=3000
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/amdox?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-this-in-production
```

Or copy from `.env.example`:
```bash
cp .env.example .env
```

Then edit `.env` with your MongoDB connection string.

### 3. Start the Backend Server

```bash
cd server
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### 4. Open the Frontend

Open `index.html` in your web browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

Then navigate to `http://localhost:8000`

## Project Structure

```
AMDOX/
├── server/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── Employer.js       # Employer profile model
│   │   └── Seeker.js          # Job seeker profile model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── employers.js      # Employer API routes
│   │   ├── seekers.js         # Seeker API routes
│   │   └── upload.js          # File upload routes
│   ├── uploads/
│   │   └── resumes/            # Resume storage
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Express server
├── index.html                 # Authentication page
├── employer-profile.html      # Employer profile form
├── seeker-profile.html        # Seeker profile form
├── employers-list.html        # List all employers
├── seekers-list.html          # List all job seekers
└── [other frontend files]
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Employers
- `GET /api/employers` - Get all employers (with optional `?search=keyword`)
- `GET /api/employers/:id` - Get single employer
- `POST /api/employers` - Create/update employer profile

### Job Seekers
- `GET /api/seekers` - Get all seekers (with optional `?search=keyword`)
- `GET /api/seekers/:id` - Get single seeker
- `POST /api/seekers` - Create/update seeker profile

### File Upload
- `POST /api/upload/resume` - Upload resume file (PDF, DOC, DOCX)

## Usage

1. **Register**: Create an account as either a Job Seeker or Employer
2. **Login**: Sign in with your credentials
3. **Complete Profile**: Fill out your profile information
4. **Browse**: View all registered employers or job seekers on the listing pages

## Notes

- Resume files are stored in `server/uploads/resumes/`
- Maximum file size: 5MB
- Supported resume formats: PDF, DOC, DOCX
- Passwords are hashed using bcryptjs before storage

## Development

To run in development mode with auto-reload:

```bash
cd server
npm run dev
```

Make sure to install `nodemon` as a dev dependency.

## License

3.2 group project 1
