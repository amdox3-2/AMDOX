const API_BASE_URL = 'http://localhost:3000/api';

// Get current user from sessionStorage
const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

// Load existing profile data if user is logged in
async function loadProfile() {
  if (!currentUser.userId) {
    // Redirect to login if not logged in
    window.location.href = 'index.html';
    return;
  }

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
      // Optionally redirect to employers list
      // window.location.href = 'employers-list.html';
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

