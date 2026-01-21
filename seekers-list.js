const API_BASE_URL = 'http://127.0.0.1:3000/api';

// DOM elements
const seekersGrid = document.getElementById('seekersGrid');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');

let allSeekers = [];
let searchTimeout;

// Security: Escape HTML to prevent XSS attacks
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Fetch all seekers
async function fetchSeekers(searchTerm = '') {
  try {
    loading.style.display = 'block';
    errorMessage.style.display = 'none';
    noResults.style.display = 'none';
    seekersGrid.innerHTML = '';

    const url = searchTerm 
      ? `${API_BASE_URL}/seekers?search=${encodeURIComponent(searchTerm)}`
      : `${API_BASE_URL}/seekers`;

    const response = await fetch(url);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch job seekers');
    }

    allSeekers = result.data;
    loading.style.display = 'none';

    if (allSeekers.length === 0) {
      noResults.style.display = 'block';
      return;
    }

    displaySeekers(allSeekers);
  } catch (error) {
    console.error('Error fetching seekers:', error);
    loading.style.display = 'none';
    errorMessage.textContent = `Error: ${error.message}`;
    errorMessage.style.display = 'block';
  }
}

// Display seekers in grid
function displaySeekers(seekers) {
  seekersGrid.innerHTML = '';

  seekers.forEach(seeker => {
    const card = createSeekerCard(seeker);
    seekersGrid.appendChild(card);
  });
}

// Create seeker card element
function createSeekerCard(seeker) {
  const card = document.createElement('div');
  card.className = 'seeker-card';

  // Escape all user input to prevent XSS
  const fullName = escapeHtml(seeker.fullName || 'Name Not Provided');
  const email = escapeHtml(seeker.email || '');
  const phone = escapeHtml(seeker.phone || '');
  const address = escapeHtml(seeker.address || '');
  const skills = seeker.skills 
    ? escapeHtml(seeker.skills.length > 150 
        ? seeker.skills.substring(0, 150) + '...' 
        : seeker.skills)
    : 'No skills information available';

  const hasResume = seeker.resumeFileName && seeker.resumePath;

  // Build card using DOM methods instead of innerHTML for better security
  const h3 = document.createElement('h3');
  h3.textContent = fullName;
  card.appendChild(h3);

  const seekerInfo = document.createElement('div');
  seekerInfo.className = 'seeker-info';

  if (email) {
    const emailItem = document.createElement('div');
    emailItem.className = 'info-item';
    const emailIcon = document.createElement('i');
    emailIcon.className = 'bx bx-envelope';
    const emailSpan = document.createElement('span');
    emailSpan.textContent = email;
    emailItem.appendChild(emailIcon);
    emailItem.appendChild(emailSpan);
    seekerInfo.appendChild(emailItem);
  }

  if (phone) {
    const phoneItem = document.createElement('div');
    phoneItem.className = 'info-item';
    const phoneIcon = document.createElement('i');
    phoneIcon.className = 'bx bx-phone';
    const phoneSpan = document.createElement('span');
    phoneSpan.textContent = phone;
    phoneItem.appendChild(phoneIcon);
    phoneItem.appendChild(phoneSpan);
    seekerInfo.appendChild(phoneItem);
  }

  if (address) {
    const addressItem = document.createElement('div');
    addressItem.className = 'info-item';
    const addressIcon = document.createElement('i');
    addressIcon.className = 'bx bx-map';
    const addressSpan = document.createElement('span');
    addressSpan.textContent = address;
    addressItem.appendChild(addressIcon);
    addressItem.appendChild(addressSpan);
    seekerInfo.appendChild(addressItem);
  }

  if (seeker.dateOfBirth) {
    const dateItem = document.createElement('div');
    dateItem.className = 'info-item';
    const dateIcon = document.createElement('i');
    dateIcon.className = 'bx bx-calendar';
    const dateSpan = document.createElement('span');
    dateSpan.textContent = new Date(seeker.dateOfBirth).toLocaleDateString();
    dateItem.appendChild(dateIcon);
    dateItem.appendChild(dateSpan);
    seekerInfo.appendChild(dateItem);
  }

  card.appendChild(seekerInfo);

  const skillsDiv = document.createElement('div');
  skillsDiv.className = 'skills';
  skillsDiv.textContent = skills;
  card.appendChild(skillsDiv);

  const badge = document.createElement('span');
  badge.className = hasResume ? 'resume-badge' : 'resume-badge no-resume';
  badge.innerHTML = hasResume 
    ? `<i class='bx bx-file'></i> Resume Available`
    : `<i class='bx bx-x-circle'></i> No Resume`;
  card.appendChild(badge);

  return card;
}

// Search functionality with debounce
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const searchTerm = e.target.value.trim();
  
  searchTimeout = setTimeout(() => {
    fetchSeekers(searchTerm);
  }, 300);
});

// Initial load
fetchSeekers();

