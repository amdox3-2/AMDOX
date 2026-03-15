const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

const seekersGrid = document.getElementById('seekersGrid');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');

async function fetchSeekers(searchTerm = '') {
    try {
        loading.style.display = 'block';
        noResults.style.display = 'none';
        seekersGrid.innerHTML = '';

        const url = searchTerm 
            ? `${API_BASE_URL}/seekers?search=${encodeURIComponent(searchTerm)}`
            : `${API_BASE_URL}/seekers`;

        const response = await fetch(url);
        const result = await response.json();

        loading.style.display = 'none';

        if (!result.success || !result.data || result.data.length === 0) {
            noResults.style.display = 'block';
            return;
        }

        displaySeekers(result.data);
    } catch (error) {
        console.error('Error:', error);
        loading.style.display = 'none';
        noResults.style.display = 'block';
    }
}

function displaySeekers(seekers) {
    seekersGrid.innerHTML = seekers.map(seeker => {
        const skills = seeker.skills ? seeker.skills.split(',').map(s => s.trim()) : [];
        const hasResume = !!(seeker.resumeFileName && seeker.resumePath);

        return `
            <div class="seeker-card">
                <div class="resume-status ${hasResume ? 'status-ready' : 'status-none'}">
                    ${hasResume ? 'Verified Talent' : 'Profile Only'}
                </div>
                <div class="seeker-header">
                    <div class="seeker-avatar">
                        <i class='bx bxs-user-pin'></i>
                    </div>
                    <div>
                        <h4 style="font-size: 1.25rem;">${seeker.fullName || 'Anonymous'}</h4>
                        <p style="color: var(--secondary); font-size: 0.85rem;">${seeker.address || 'Remote / Global'}</p>
                    </div>
                </div>
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #475569; margin-bottom: 8px;">
                        <i class='bx bx-envelope'></i> ${seeker.email}
                    </div>
                    ${seeker.phone ? `
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #475569;">
                        <i class='bx bx-phone'></i> ${seeker.phone}
                    </div>` : ''}
                </div>
                <div style="margin-top: auto;">
                    <h5 style="font-size: 0.8rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px; letter-spacing: 1px;">Core Competencies</h5>
                    <div>
                        ${skills.length > 0 ? skills.slice(0, 5).map(s => `<span class="skills-tag">${s}</span>`).join('') : '<span class="skills-tag">Generalist</span>'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

let timeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fetchSeekers(e.target.value.trim()), 400);
});

fetchSeekers();

