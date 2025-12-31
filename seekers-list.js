const API_BASE_URL = 'http://localhost:3000/api';

// DOM elements
const seekersGrid = document.getElementById('seekersGrid');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');

let allSeekers = [];
let searchTimeout;

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

  const skills = seeker.skills 
    ? (seeker.skills.length > 150 
        ? seeker.skills.substring(0, 150) + '...' 
        : seeker.skills)
    : 'No skills information available';

  const hasResume = seeker.resumeFileName && seeker.resumePath;

  card.innerHTML = `
    <h3>${seeker.fullName || 'Name Not Provided'}</h3>
    <div class="seeker-info">
      ${seeker.email ? `
        <div class="info-item">
          <i class='bx bx-envelope'></i>
          <span>${seeker.email}</span>
        </div>
      ` : ''}
      ${seeker.phone ? `
        <div class="info-item">
          <i class='bx bx-phone'></i>
          <span>${seeker.phone}</span>
        </div>
      ` : ''}
      ${seeker.address ? `
        <div class="info-item">
          <i class='bx bx-map'></i>
          <span>${seeker.address}</span>
        </div>
      ` : ''}
      ${seeker.dateOfBirth ? `
        <div class="info-item">
          <i class='bx bx-calendar'></i>
          <span>${new Date(seeker.dateOfBirth).toLocaleDateString()}</span>
        </div>
      ` : ''}
    </div>
    <div class="skills">${skills}</div>
    ${hasResume ? `
      <span class="resume-badge">
        <i class='bx bx-file'></i> Resume Available
      </span>
    ` : `
      <span class="resume-badge no-resume">
        <i class='bx bx-x-circle'></i> No Resume
      </span>
    `}
  `;

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

