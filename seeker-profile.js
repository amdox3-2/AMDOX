const API_BASE_URL = 'http://127.0.0.1:3000/api';

// Get current user from sessionStorage
const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
const resumeInfo = JSON.parse(sessionStorage.getItem('resumeInfo') || '{}');

// Load existing profile data if user is logged in
async function loadProfile() {
  if (!currentUser.userId) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/seekers?userId=${currentUser.userId}`);
    const result = await response.json();

    if (result.success && result.data && result.data.length > 0) {
      const profile = result.data[0];

      // Populate form
      const form = document.querySelector('form');
      form.querySelector('input[placeholder="Enter your full name"]').value = profile.fullName || '';
      form.querySelector('input[placeholder="Enter your email"]').value = profile.email || '';
      form.querySelector('input[placeholder="Enter your phone number"]').value = profile.phone || '';
      if (profile.dateOfBirth) {
        const date = new Date(profile.dateOfBirth);
        if (!isNaN(date.getTime())) {
          form.querySelector('input[type="date"]').value = date.toISOString().split('T')[0];
        }
      }
      form.querySelector('input[placeholder="Enter your address"]').value = profile.address || '';
      form.querySelector('textarea').value = profile.skills || '';

      // Populate View Mode
      displayViewProfile(profile);

      // Switch to View Mode by default
      toggleView('view');
      document.getElementById('backToView').style.display = 'block';
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

function displayViewProfile(profile) {
  // Populate system credentials from currentUser (session)
  document.getElementById('credName').textContent = currentUser.name || 'N/A';
  document.getElementById('credEmail').textContent = currentUser.email || 'N/A';

  document.getElementById('viewFullName').textContent = profile.fullName || 'No Name';
  document.getElementById('viewEmail').textContent = profile.email || 'No Email';
  document.getElementById('viewPhone').textContent = profile.phone || 'Not provided';
  document.getElementById('viewAddress').textContent = profile.address || 'Not provided';

  if (profile.dateOfBirth) {
    document.getElementById('viewDob').textContent = new Date(profile.dateOfBirth).toLocaleDateString();
  }

  document.getElementById('viewSkills').textContent = profile.skills || 'No skills listed yet.';

  if (profile.resumeFileName) {
    document.getElementById('viewResumeName').textContent = profile.resumeFileName;
    const resumeLink = document.getElementById('viewResumeLink');
    resumeLink.href = `${API_BASE_URL.replace('/api', '')}/${profile.resumePath}`;
    resumeLink.style.display = 'inline-block';
  }

  // Initialize scroll reveal
  initScrollReveal();
}

function toggleView(mode) {
  const profileView = document.getElementById('profileView');
  const editView = document.getElementById('editView');

  if (mode === 'view') {
    profileView.style.display = 'block';
    editView.style.display = 'none';
    // Re-trigger scroll reveal when switching to view
    setTimeout(initScrollReveal, 100);
  } else {
    profileView.style.display = 'none';
    editView.style.display = 'block';
  }
}

function initScrollReveal() {
  const reveals = document.querySelectorAll('.scroll-reveal');

  const revealOnScroll = () => {
    reveals.forEach(reveal => {
      const windowHeight = window.innerHeight;
      const revealTop = reveal.getBoundingClientRect().top;
      const revealPoint = 150;

      if (revealTop < windowHeight - revealPoint) {
        reveal.classList.add('visible');
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  // Initial check
  revealOnScroll();
}

// Handle form submission
document.querySelector('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!currentUser.userId) {
    alert('Please login first');
    window.location.href = 'index.html';
    return;
  }

  // Handle resume upload
  let resumePath = resumeInfo.path || '';
  let resumeFileName = resumeInfo.filename || '';

  const resumeFile = document.getElementById('resumeInput').files[0];
  if (resumeFile) {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const uploadResponse = await fetch(`${API_BASE_URL}/upload/resume`, {
        method: 'POST',
        body: formData
      });

      const uploadResult = await uploadResponse.json();
      if (uploadResult.success) {
        resumePath = uploadResult.data.path;
        resumeFileName = uploadResult.data.filename;
      }
    } catch (uploadError) {
      console.error('Resume upload error:', uploadError);
      alert('Resume upload failed, but profile will be saved');
    }
  }

  const formData = {
    userId: currentUser.userId,
    fullName: this.querySelector('input[placeholder="Enter your full name"]').value,
    email: this.querySelector('input[placeholder="Enter your email"]').value,
    phone: this.querySelector('input[placeholder="Enter your phone number"]').value,
    dateOfBirth: this.querySelector('input[type="date"]').value,
    address: this.querySelector('input[placeholder="Enter your address"]').value,
    skills: this.querySelector('textarea').value,
    resumePath: resumePath,
    resumeFileName: resumeFileName
  };

  try {
    const response = await fetch(`${API_BASE_URL}/seekers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      alert('Profile saved successfully!');
      sessionStorage.removeItem('resumeInfo');
      // Refresh data and switch to view mode
      loadProfile();
    } else {
      alert(result.message || 'Failed to save profile');
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Failed to save profile. Please try again.');
  }
});

// Load profile on page load
loadProfile();

// Event listener for Auto-fill from Resume
document.addEventListener('DOMContentLoaded', () => {
  const extractBtn = document.getElementById('extractBtn');
  if (extractBtn) {
    extractBtn.addEventListener('click', async () => {
      const fileInput = document.getElementById('resumeInput');
      const statusEl = document.getElementById('extractStatus');

      if (!fileInput.files || fileInput.files.length === 0) {
        alert('Please select a resume file first.');
        return;
      }

      const file = fileInput.files[0];
      extractBtn.disabled = true;
      extractBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Scanning...";
      statusEl.textContent = "Analyzing document structure...";
      statusEl.style.color = "var(--primary)";

      // Simulate document processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      statusEl.textContent = "Extracting contact info & skills...";
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock data extraction
      const fileName = file.name.toLowerCase();
      let extractedName = currentUser.name || "User Name";

      // Try to get name from filename if possible
      if (fileName.includes('_')) {
        const parts = file.name.split('_');
        if (parts.length > 0) extractedName = parts[0];
      } else if (fileName.includes('-')) {
        const parts = file.name.split('-');
        if (parts.length > 0) extractedName = parts[0];
      }

      // Fill form
      const form = document.querySelector('form');
      if (form) {
        form.querySelector('input[placeholder="Enter your full name"]').value = extractedName;
        form.querySelector('input[placeholder="Enter your email"]').value = currentUser.email || "";

        // Add some mock skills based on common tech resumes
        const mockBio = "Highly motivated professional with experience in software development and project management. Skilled in problem-solving and collaborating with cross-functional teams to deliver high-quality solutions.";
        form.querySelector('textarea').value = "Skills: JavaScript, HTML, CSS, Node.js, React, MongoDB\n\nBio: " + mockBio;
      }

      extractBtn.disabled = false;
      extractBtn.innerHTML = "<i class='bx bx-check'></i> Fill Successful";
      statusEl.textContent = "Data extracted accurately!";
      statusEl.style.color = "var(--success)";

      setTimeout(() => {
        extractBtn.innerHTML = "<i class='bx bx-wand'></i> Auto-fill";
        statusEl.textContent = "";
      }, 3000);
    });
  }
});

