const API_BASE_URL = 'http://localhost:3000/api';

// DOM elements
const employersGrid = document.getElementById('employersGrid');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');

let allEmployers = [];
let searchTimeout;

// Fetch all employers
async function fetchEmployers(searchTerm = '') {
    try {
        loading.style.display = 'block';
        errorMessage.style.display = 'none';
        noResults.style.display = 'none';
        employersGrid.innerHTML = '';

        const url = searchTerm
            ? `${API_BASE_URL}/employers?search=${encodeURIComponent(searchTerm)}`
            : `${API_BASE_URL}/employers`;

        const response = await fetch(url);
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch employers');
        }

        allEmployers = result.data;
        loading.style.display = 'none';

        if (allEmployers.length === 0) {
            noResults.style.display = 'block';
            return;
        }

        displayEmployers(allEmployers);
    } catch (error) {
        console.error('Error fetching employers:', error);
        loading.style.display = 'none';
        errorMessage.textContent = `Error: ${error.message}`;
        errorMessage.style.display = 'block';
    }
}

// Display employers in grid
function displayEmployers(employers) {
    employersGrid.innerHTML = '';

    employers.forEach(employer => {
        const card = createEmployerCard(employer);
        employersGrid.appendChild(card);
    });
}

// Create employer card element
function createEmployerCard(employer) {
    const card = document.createElement('div');
    card.className = 'employer-card';

    const description = employer.description
        ? (employer.description.length > 150
            ? employer.description.substring(0, 150) + '...'
            : employer.description)
        : 'No description available';

    card.innerHTML = `
    <h3>${employer.companyName || 'Company Name'}</h3>
    <div class="company-info">
      ${employer.contactEmail ? `
        <div class="info-item">
          <i class='bx bx-envelope'></i>
          <span>${employer.contactEmail}</span>
        </div>
      ` : ''}
      ${employer.phone ? `
        <div class="info-item">
          <i class='bx bx-phone'></i>
          <span>${employer.phone}</span>
        </div>
      ` : ''}
      ${employer.address ? `
        <div class="info-item">
          <i class='bx bx-map'></i>
          <span>${employer.address}</span>
        </div>
      ` : ''}
    </div>
    ${employer.website ? `
      <a href="${employer.website}" target="_blank" class="website-link">
        <i class='bx bx-link-external'></i> Visit Website
      </a>
    ` : ''}
    <div class="description">${description}</div>
  `;

    return card;
}

// Search functionality with debounce
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const searchTerm = e.target.value.trim();

    searchTimeout = setTimeout(() => {
        fetchEmployers(searchTerm);
    }, 300);
});

// Initial load
fetchEmployers();

