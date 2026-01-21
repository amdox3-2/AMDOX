const API_BASE_URL = 'http://127.0.0.1:3000/api';

// Get current user from sessionStorage
const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser.userId) {
        window.location.href = 'index.html';
        return;
    }

    setupDashboard();
    handleTabSwitching();
    loadRoleSpecificContent();
});

function setupDashboard() {
    document.getElementById('welcomeText').textContent = `Welcome back, ${currentUser.name}!`;
    document.getElementById('roleBadge').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);

    // Show/hide menu items based on role
    if (currentUser.role === 'employer') {
        document.querySelectorAll('.employer-only').forEach(el => el.style.display = 'flex');
        document.querySelectorAll('.seeker-only').forEach(el => el.style.display = 'none');
        document.getElementById('employerActions').style.display = 'block';
        document.getElementById('navProfile').href = 'employer-profile.html';
    } else {
        document.querySelectorAll('.employer-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.seeker-only').forEach(el => el.style.display = 'flex');
        document.getElementById('navProfile').href = 'seeker-profile.html';
    }

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
}

function handleTabSwitching() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.id === 'logoutBtn' || item.id === 'navProfile') return;
            e.preventDefault();

            const targetTab = item.getAttribute('data-tab');

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${targetTab.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}Tab`) {
                    content.classList.add('active');
                }
            });

            // Trigger data load for the specific tab
            loadTabData(targetTab);
        });
    });
}

function loadRoleSpecificContent() {
    if (currentUser.role === 'employer') {
        loadEmployerOverview();
    } else {
        loadSeekerOverview();
    }
}

async function loadTabData(tab) {
    switch (tab) {
        case 'overview':
            loadRoleSpecificContent();
            break;
        case 'my-jobs':
            loadEmployerJobs();
            break;
        case 'find-jobs':
            loadAvailableJobs();
            break;
        case 'my-apps':
            loadSeekerApplications();
            break;
    }
}

// --- Employer Functions ---

async function loadEmployerOverview() {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs?employerId=${currentUser.userId}`);
        const result = await response.json();

        const jobs = result.data || [];
        const activeJobs = jobs.filter(j => j.status === 'Open').length;

        // Populate stats
        const statsGrid = document.getElementById('statsGrid');
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon stat-blue"><i class='bx bx-briefcase'></i></div>
                <div class="stat-info"><h4>Total Listings</h4><p>${jobs.length}</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-green"><i class='bx bx-check-circle'></i></div>
                <div class="stat-info"><h4>Active Jobs</h4><p>${activeJobs}</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-purple"><i class='bx bx-user-voice'></i></div>
                <div class="stat-info"><h4>Applications</h4><p>-</p></div>
            </div>
        `;

        // Load recent jobs
        const recentList = document.getElementById('recentList');
        document.getElementById('recentTitle').textContent = 'Your Recent Listings';

        if (jobs.length === 0) {
            recentList.innerHTML = '<p>You haven\'t posted any jobs yet.</p>';
            return;
        }

        displayJobsList(jobs.slice(0, 5), recentList);
    } catch (error) {
        console.error('Error loading employer overview:', error);
    }
}

async function loadEmployerJobs() {
    const list = document.getElementById('employerJobsList');
    list.innerHTML = '<p>Loading your jobs...</p>';
    try {
        const response = await fetch(`${API_BASE_URL}/jobs?employerId=${currentUser.userId}`);
        const result = await response.json();
        displayJobsList(result.data, list, true);
    } catch (error) {
        list.innerHTML = '<p>Error loading jobs.</p>';
    }
}

// --- Seeker Functions ---

async function loadSeekerOverview() {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs`);
        const result = await response.json();
        const jobs = result.data || [];

        const statsGrid = document.getElementById('statsGrid');
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon stat-blue"><i class='bx bx-search-alt'></i></div>
                <div class="stat-info"><h4>Jobs Found</h4><p>${jobs.length}</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon stat-green"><i class='bx bx-send'></i></div>
                <div class="stat-info"><h4>Applied</h4><p>-</p></div>
            </div>
        `;

        const recentList = document.getElementById('recentList');
        document.getElementById('recentTitle').textContent = 'New Job Opportunities';
        displayJobsList(jobs.slice(0, 5), recentList);
    } catch (error) {
        console.error('Error loading seeker overview:', error);
    }
}

async function loadAvailableJobs() {
    const grid = document.getElementById('availableJobsGrid');
    const search = document.getElementById('jobSearchInput').value;
    const location = document.getElementById('locationFilter').value;
    const type = document.getElementById('typeFilter').value;

    grid.innerHTML = '<p>Searching for jobs...</p>';
    try {
        let url = `${API_BASE_URL}/jobs?`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (location) url += `location=${encodeURIComponent(location)}&`;
        if (type) url += `type=${encodeURIComponent(type)}&`;

        const response = await fetch(url);
        const result = await response.json();
        displayJobsList(result.data, grid);
    } catch (error) {
        grid.innerHTML = '<p>Error loading jobs.</p>';
    }
}

// Add event listeners for filters
document.getElementById('jobSearchInput').addEventListener('input', debounce(loadAvailableJobs, 500));
document.getElementById('locationFilter').addEventListener('input', debounce(loadAvailableJobs, 500));
document.getElementById('typeFilter').addEventListener('change', loadAvailableJobs);

function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

async function viewApplications(jobId) {
    const modal = document.getElementById('jobModal');
    const body = document.getElementById('jobModalBody');
    modal.style.display = 'block';
    body.innerHTML = 'Loading applications...';

    try {
        const response = await fetch(`${API_BASE_URL}/applications/job/${jobId}`);
        const result = await response.json();
        const apps = result.data;

        if (apps.length === 0) {
            body.innerHTML = '<h3>Applications</h3><p>No applications yet for this job.</p>';
            return;
        }

        body.innerHTML = `
            <h3>Applications for Job</h3>
            <div class="apps-container">
                ${apps.map(app => `
                    <div class="app-card-detailed">
                        <h4>${app.seekerProfile ? app.seekerProfile.fullName : 'Unknown Candidate'}</h4>
                        <p><strong>Email:</strong> ${app.seekerProfile ? app.seekerProfile.email : 'N/A'}</p>
                        <p><strong>Applied:</strong> ${new Date(app.appliedDate).toLocaleDateString()}</p>
                        <p><strong>Message:</strong> ${app.coverLetter || 'No message provided'}</p>
                        <div class="app-actions-row">
                            <select onchange="updateAppStatus('${app._id}', this.value)">
                                <option value="Pending" ${app.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Reviewed" ${app.status === 'Reviewed' ? 'selected' : ''}>Reviewed</option>
                                <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
                                <option value="Accepted" ${app.status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                                <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                            </select>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        body.innerHTML = 'Error loading applications.';
    }
}

async function updateAppStatus(appId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/applications/${appId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const result = await response.json();
        if (result.success) {
            alert('Status updated!');
        }
    } catch (error) {
        alert('Failed to update status.');
    }
}

async function loadSeekerApplications() {
    const list = document.getElementById('seekerAppsList');
    list.innerHTML = '<p>Loading your applications...</p>';
    try {
        const response = await fetch(`${API_BASE_URL}/applications/seeker/${currentUser.userId}`);
        const result = await response.json();

        if (result.data.length === 0) {
            list.innerHTML = '<p>You haven\'t applied for any jobs yet.</p>';
            return;
        }

        list.innerHTML = result.data.map(app => `
            <div class="app-card-row">
                <div class="app-info">
                    <h4>${app.job.title}</h4>
                    <p>${app.job.companyName || 'Unknown Company'} • ${app.job.location}</p>
                    <small>Applied on ${new Date(app.appliedDate).toLocaleDateString()}</small>
                </div>
                <div class="app-status">
                    <span class="badge status-${app.status.toLowerCase()}">${app.status}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = '<p>Error loading applications.</p>';
    }
}

// --- Shared Display Functions ---

function displayJobsList(jobs, container, showActions = false) {
    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<p>No jobs found.</p>';
        return;
    }

    container.innerHTML = jobs.map(job => `
        <div class="job-card-row">
            <div class="job-main-info">
                <h4>${job.title}</h4>
                <p><i class='bx bx-map'></i> ${job.location} • <i class='bx bx-time'></i> ${job.jobType}</p>
                <p class="salary">${job.salaryRange}</p>
            </div>
            <div class="job-actions">
                ${showActions && currentUser.role === 'employer' ? `
                    <button class="action-btn" onclick="viewApplications('${job._id}')"><i class='bx bx-group'></i> Apps</button>
                    <button class="action-btn" onclick="editJob('${job._id}')"><i class='bx bx-edit'></i></button>
                ` : `
                    <button class="primary-btn-sm" onclick="viewJobDetails('${job._id}')">View Details</button>
                `}
            </div>
        </div>
    `).join('');
}

async function viewJobDetails(jobId) {
    const modal = document.getElementById('jobModal');
    const body = document.getElementById('jobModalBody');
    modal.style.display = 'block';
    body.innerHTML = 'Loading...';

    try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
        const result = await response.json();
        const job = result.data;

        body.innerHTML = `
            <div class="job-detail-header">
                <h2>${job.title}</h2>
                <p class="company">${job.companyName}</p>
                <div class="meta">
                    <span><i class='bx bx-map'></i> ${job.location}</span>
                    <span><i class='bx bx-briefcase'></i> ${job.jobType}</span>
                    <span><i class='bx bx-money'></i> ${job.salaryRange}</span>
                </div>
            </div>
            <div class="job-detail-body">
                <h3>Description</h3>
                <p>${job.description}</p>
                <h3>Qualifications</h3>
                <p>${job.qualifications}</p>
                <h3>Responsibilities</h3>
                <p>${job.responsibilities}</p>
            </div>
            ${currentUser.role === 'seeker' ? `
                <div class="job-detail-footer">
                    <button class="primary-btn" id="applyNowBtn">Apply for this Job</button>
                </div>
            ` : ''}
        `;

        if (currentUser.role === 'seeker') {
            document.getElementById('applyNowBtn').onclick = () => handleApply(job._id);
        }
    } catch (error) {
        body.innerHTML = 'Error loading job details.';
    }
}

async function handleApply(jobId) {
    if (confirm('Are you sure you want to apply for this job? Your profile resume will be shared with the employer.')) {
        try {
            // In a real app, we'd have a field for cover letter. For now, we'll send a default or prompt.
            const coverLetter = prompt('Optional: Enter a short cover message', 'I am interested in this position.');

            const response = await fetch(`${API_BASE_URL}/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId,
                    seekerId: currentUser.userId,
                    coverLetter: coverLetter || '',
                    resumeSnapshot: 'Uploaded Resume' // Simplified for demo
                })
            });

            const result = await response.json();
            if (result.success) {
                alert('Application submitted successfully!');
                document.getElementById('jobModal').style.display = 'none';
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Failed to submit application.');
        }
    }
}

// Modal handling
document.querySelector('.close').onclick = () => {
    document.getElementById('jobModal').style.display = 'none';
};
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
};
