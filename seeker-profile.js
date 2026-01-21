const API_BASE_URL = 'http://127.0.0.1:3000/api';

// Get current user from sessionStorage
const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
const resumeInfo = JSON.parse(sessionStorage.getItem('resumeInfo') || '{}');

// Load existing profile data if user is logged in
async function loadProfile() {
  if (!currentUser.userId) {
    // Redirect to login if not logged in
    window.location.href = 'index.html';
    return;
  }

  try {
    // Try to fetch existing seeker profile
    const response = await fetch(`${API_BASE_URL}/seekers?userId=${currentUser.userId}`);
    const result = await response.json();

    if (result.success && result.data && result.data.length > 0) {
      const profile = result.data[0];
      // Populate form with existing data
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
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

// Handle form submission
document.querySelector('form').addEventListener('submit', async function(e) {
  e.preventDefault();

  if (!currentUser.userId) {
    alert('Please login first');
    window.location.href = 'index.html';
    return;
  }

  // Handle resume upload
  let resumePath = resumeInfo.path || '';
  let resumeFileName = resumeInfo.filename || '';

  const resumeFile = this.querySelector('input[type="file"]').files[0];
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
      // Clear resume info from sessionStorage
      sessionStorage.removeItem('resumeInfo');
      // Optionally redirect to seekers list
      // window.location.href = 'seekers-list.html';
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

