const API_BASE_URL = 'http://127.0.0.1:3000/api';

const employersGrid = document.getElementById('employersGrid');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');

async function fetchEmployers(searchTerm = '') {
    try {
        loading.style.display = 'block';
        noResults.style.display = 'none';
        employersGrid.innerHTML = '';

        const url = searchTerm 
            ? `${API_BASE_URL}/employers?search=${encodeURIComponent(searchTerm)}`
            : `${API_BASE_URL}/employers`;

        const response = await fetch(url);
        const result = await response.json();

        loading.style.display = 'none';

        if (!result.success || !result.data || result.data.length === 0) {
            noResults.style.display = 'block';
            return;
        }

        displayEmployers(result.data);
    } catch (error) {
        console.error('Error:', error);
        loading.style.display = 'none';
        noResults.style.display = 'block';
    }
}

function displayEmployers(employers) {
    employersGrid.innerHTML = employers.map(employer => `
        <div class="employer-card">
            <div class="employer-header">
                <div class="company-logo">
                    <i class='bx bxs-business'></i>
                </div>
                <div>
                    <h4 style="font-size: 1.25rem;">${employer.companyName || 'Global Partner'}</h4>
                    ${employer.website ? `
                    <a href="${employer.website}" target="_blank" style="color: #10b981; font-size: 0.85rem; text-decoration: none;">
                        <i class='bx bx-link-external'></i> ${employer.website.replace('https://', '')}
                    </a>` : ''}
                </div>
            </div>
            
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;">
                ${employer.description || 'Innovative organization focused on excellence and growth in the modern job market.'}
            </p>

            <div style="margin-top: auto; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                <div class="info-tag"><i class='bx bx-envelope'></i> ${employer.contactEmail}</div>
                ${employer.phone ? `<div class="info-tag"><i class='bx bx-phone'></i> ${employer.phone}</div>` : ''}
                ${employer.address ? `<div class="info-tag"><i class='bx bx-map-pin'></i> ${employer.address}</div>` : ''}
            </div>
        </div>
    `).join('');
}

let timeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fetchEmployers(e.target.value.trim()), 400);
});

fetchEmployers();
