const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;
const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

async function loadProfile() {
    if (!currentUser.userId) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('credName').textContent = currentUser.name || 'N/A';
    document.getElementById('credEmail').textContent = currentUser.email || 'N/A';

    try {
        const response = await fetch(`${API_BASE_URL}/employers?userId=${currentUser.userId}`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            const profile = result.data[0];
            
            // Populate form
            document.getElementById('companyName').value = profile.companyName || '';
            document.getElementById('website').value = profile.website || '';
            document.getElementById('contactEmail').value = profile.contactEmail || '';
            document.getElementById('phone').value = profile.phone || '';
            document.getElementById('address').value = profile.address || '';
            document.getElementById('description').value = profile.description || '';

            displayViewProfile(profile);
            toggleView('view');
            document.getElementById('backToView').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function displayViewProfile(profile) {
    document.getElementById('viewCompanyName').textContent = profile.companyName || 'Unregistered Entity';
    const webLink = document.getElementById('viewWebsite');
    webLink.textContent = profile.website || 'No website registered';
    webLink.href = profile.website || '#';
    document.getElementById('viewContactEmail').textContent = profile.contactEmail || 'Not provided';
    document.getElementById('viewPhone').textContent = profile.phone || 'Not provided';
    document.getElementById('viewAddress').textContent = profile.address || 'Not provided';
    document.getElementById('viewDescription').textContent = profile.description || 'Provide a vision for your company to attract talent.';
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

document.querySelector('form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = {
        userId: currentUser.userId,
        companyName: document.getElementById('companyName').value,
        website: document.getElementById('website').value,
        contactEmail: document.getElementById('contactEmail').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        description: document.getElementById('description').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/employers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (result.success) {
            alert('Corporate profile updated successfully.');
            loadProfile();
        } else {
            alert(result.message || 'Error updating profile');
        }
    } catch (error) {
        alert('Verification service unavailable.');
    }
});

loadProfile();

