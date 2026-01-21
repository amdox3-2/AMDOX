const API_BASE_URL = 'http://127.0.0.1:3000/api';

// DOM elements
const employersGrid = document.getElementById('employersGrid');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');

let allEmployers = [];
let searchTimeout;

// Security: Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Security: Sanitize URL to prevent javascript: protocol attacks
function sanitizeUrl(url) {
    if (!url) return '';
    const trimmed = url.trim().toLowerCase();
    // Allow only http://, https://, and mailto: protocols
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:')) {
        return url.trim();
    }
    // If no protocol, assume https://
    if (!trimmed.includes('://')) {
        return 'https://' + url.trim();
    }
    // Invalid protocol, return empty string
    return '';
}

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

    // Escape all user input to prevent XSS
    const companyName = escapeHtml(employer.companyName || 'Company Name');
    const contactEmail = escapeHtml(employer.contactEmail || '');
    const phone = escapeHtml(employer.phone || '');
    const address = escapeHtml(employer.address || '');
    const description = employer.description
        ? escapeHtml(employer.description.length > 150
            ? employer.description.substring(0, 150) + '...'
            : employer.description)
        : 'No description available';

    // Sanitize website URL to prevent javascript: protocol attacks
    const website = sanitizeUrl(employer.website || '');

    // Build card using DOM methods instead of innerHTML for better security
    const h3 = document.createElement('h3');
    h3.textContent = companyName;
    card.appendChild(h3);

    const companyInfo = document.createElement('div');
    companyInfo.className = 'company-info';

    if (contactEmail) {
        const emailItem = document.createElement('div');
        emailItem.className = 'info-item';
        emailItem.innerHTML = `<i class='bx bx-envelope'></i><span>${contactEmail}</span>`;
        companyInfo.appendChild(emailItem);
    }

    if (phone) {
        const phoneItem = document.createElement('div');
        phoneItem.className = 'info-item';
        phoneItem.innerHTML = `<i class='bx bx-phone'></i><span>${phone}</span>`;
        companyInfo.appendChild(phoneItem);
    }

    if (address) {
        const addressItem = document.createElement('div');
        addressItem.className = 'info-item';
        addressItem.innerHTML = `<i class='bx bx-map'></i><span>${address}</span>`;
        companyInfo.appendChild(addressItem);
    }

    card.appendChild(companyInfo);

    if (website) {
        const websiteLink = document.createElement('a');
        websiteLink.href = website;
        websiteLink.target = '_blank';
        websiteLink.rel = 'noopener noreferrer'; // Security: prevent tabnabbing
        websiteLink.className = 'website-link';
        websiteLink.innerHTML = `<i class='bx bx-link-external'></i> Visit Website`;
        card.appendChild(websiteLink);
    }

    const descDiv = document.createElement('div');
    descDiv.className = 'description';
    descDiv.textContent = description;
    card.appendChild(descDiv);

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
