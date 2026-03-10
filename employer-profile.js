const API_BASE_URL = 'http://127.0.0.1:3000/api';

// Get current user from sessionStorage
const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

// Load existing profile data if user is logged in
async function loadProfile() {
  if (!currentUser.userId) {
    // Redirect to login if not logged in
    window.location.href = 'index.html';
    return;
  }

  // Populate system credentials
  document.getElementById('credName').textContent = currentUser.name || 'N/A';
  document.getElementById('credEmail').textContent = currentUser.email || 'N/A';

  try {
    // Try to fetch existing employer profile
    const response = await fetch(`${API_BASE_URL}/employers?userId=${currentUser.userId}`);
    const result = await response.json();

    if (result.success && result.data && result.data.length > 0) {
      const profile = result.data[0];
      // Populate form with existing data
      const form = document.querySelector('form');
      form.querySelector('input[placeholder="Enter company name"]').value = profile.companyName || '';
      form.querySelector('input[placeholder="https://example.com"]').value = profile.website || '';
      form.querySelector('input[placeholder="hr@company.com"]').value = profile.contactEmail || '';
      form.querySelector('input[placeholder="+1234567890"]').value = profile.phone || '';
      form.querySelector('input[placeholder="Enter address"]').value = profile.address || '';
      form.querySelector('textarea').value = profile.description || '';

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
  document.getElementById('viewCompanyName').textContent = profile.companyName || 'No Name';
  document.getElementById('viewWebsite').textContent = profile.website || 'No Website';
  document.getElementById('viewWebsite').href = profile.website || '#';
  document.getElementById('viewContactEmail').textContent = profile.contactEmail || 'Not provided';
  document.getElementById('viewPhone').textContent = profile.phone || 'Not provided';
  document.getElementById('viewAddress').textContent = profile.address || 'Not provided';
  document.getElementById('viewDescription').textContent = profile.description || 'No description provided.';
}

function toggleView(mode) {
  const profileView = document.getElementById('profileView');
  const editView = document.getElementById('editView');

  if (mode === 'view') {
    profileView.style.display = 'block';
    editView.style.display = 'none';
  } else {
    profileView.style.display = 'none';
    editView.style.display = 'block';
  }
}

// Handle form submission
document.querySelector('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  if (!currentUser.userId) {
    alert('Please login first');
    window.location.href = 'index.html';
    return;
  }

  const formData = {
    userId: currentUser.userId,
    companyName: this.querySelector('input[placeholder="Enter company name"]').value,
    website: this.querySelector('input[placeholder="https://example.com"]').value,
    contactEmail: this.querySelector('input[placeholder="hr@company.com"]').value,
    phone: this.querySelector('input[placeholder="+1234567890"]').value,
    address: this.querySelector('input[placeholder="Enter address"]').value,
    description: this.querySelector('textarea').value
  };

  try {
    const response = await fetch(`${API_BASE_URL}/employers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      alert('Profile saved successfully!');
      // Refresh and switch to view mode
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

