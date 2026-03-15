const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;
const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

// Extract Job ID from URL
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('id');

const loadingState = document.getElementById('loadingState');
const jobDetails = document.getElementById('jobDetails');
const actionArea = document.getElementById('actionArea');
const applyBtn = document.getElementById('applyBtn');

async function fetchJobDetails() {
    if (!jobId) {
        window.location.href = 'dashboard.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
        const result = await response.json();

        if (result.success) {
            populateDetails(result.data);
        } else {
            alert('Failed to load opportunity details.');
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Error:', error);
        // Fallback or alert
        alert('Connectivity issue. Please ensure the server is running.');
    }
}

function populateDetails(job) {
    document.getElementById('companyName').textContent = job.companyName || 'Corporate Partner';
    document.getElementById('jobTitle').textContent = job.title;
    document.getElementById('location').textContent = job.location;
    document.getElementById('jobType').textContent = job.jobType;
    document.getElementById('salaryRange').textContent = job.salaryRange;
    document.getElementById('description').textContent = job.description;
    document.getElementById('qualifications').textContent = job.qualifications;
    document.getElementById('responsibilities').textContent = job.responsibilities;

    // Show/Hide apply button based on role
    if (currentUser.role !== 'seeker') {
        actionArea.style.display = 'none';
    }

    loadingState.style.display = 'none';
    jobDetails.style.display = 'block';
}

async function handleApply() {
    if (!currentUser.userId) {
        alert('Session expired. Please sign in.');
        window.location.href = 'index.html';
        return;
    }

    const originalText = applyBtn.innerHTML;
    applyBtn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Processing...`;
    applyBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jobId: jobId,
                seekerId: currentUser.userId,
                coverLetter: '', // Optional for now
                resumeSnapshot: 'Linked Profile'
            })
        });

        const result = await response.json();
        
        if (result.success) {
            applyBtn.innerHTML = `<i class='bx bx-check'></i> Application Sent`;
            applyBtn.style.background = "var(--success)";
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            alert(result.message || 'Application failed');
            applyBtn.innerHTML = originalText;
            applyBtn.disabled = false;
        }
    } catch (error) {
        // Mock success if server is offline during demo
        console.warn("Server offline, simulating success for demo.");
        applyBtn.innerHTML = `<i class='bx bx-check'></i> Demo Submitted`;
        applyBtn.style.background = "var(--success)";
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }
}

applyBtn.addEventListener('click', handleApply);

// Initialize
fetchJobDetails();
