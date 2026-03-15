const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

// Handle Login Form Submission
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem('currentUser', JSON.stringify(result.data));
            window.location.href = 'dashboard.html';
        } else {
            alert(result.message || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login services are currently offline. Please ensure the server is running.');
    }
});

// Handle Register Form Submission
document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    
    // Get role from active tab
    const activeTab = document.querySelector('.role-tab.active');
    const role = activeTab ? activeTab.getAttribute('data-role') : 'seeker';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem('currentUser', JSON.stringify(result.data));
            window.location.href = 'dashboard.html';
        } else {
            alert(result.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Server unreachable. Please check your connection.');
    }
});

// --- Social Login Handling ---
async function handleSocialLogin(type) {
    const btn = document.getElementById(`${type}Btn`);
    if (!btn) return;
    
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Syncing...`;
    btn.disabled = true;

    // Simulate OAuth Delay
    await new Promise(r => setTimeout(r, 600));

    const mockName = prompt(`Sign in with ${type.charAt(0).toUpperCase() + type.slice(1)}\n\nPlease enter your display name:`, "Social Explorer");
    
    if (!mockName) {
        btn.innerHTML = originalContent;
        btn.disabled = false;
        return;
    }

    const mockEmail = `${mockName.toLowerCase().replace(/\s/g, '')}@${type}.demo`;
    const mockSocialId = `${type}_${Math.random().toString(36).substr(2, 9)}`;
    const activeTab = document.querySelector('.role-tab.active');
    const role = activeTab ? activeTab.getAttribute('data-role') : 'seeker';

    const loginData = {
        email: mockEmail,
        name: mockName,
        socialId: mockSocialId,
        authType: type,
        role: role
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const result = await response.json();
            if (result.success) {
                sessionStorage.setItem('currentUser', JSON.stringify(result.data));
                completeLogin(btn);
                return;
            }
        }
        
        // If we reach here, server returned something else (like 404 or 500 HTML)
        console.warn("Server response was not JSON, falling back to Demo Mode.");
        throw new Error("Server offline");

    } catch (error) {
        console.log("Demo Mode Activated: Bypassing backend for visual testing.");
        
        // DEMO MODE: Create a local session so the UI still works
        const demoUser = {
            userId: "demo_" + Date.now(),
            name: mockName,
            email: mockEmail,
            role: role
        };
        
        sessionStorage.setItem('currentUser', JSON.stringify(demoUser));
        
        // Show a helpful hint that we're in demo mode
        const hint = document.createElement('div');
        hint.style = "position:fixed; bottom:20px; left:20px; background:rgba(0,0,0,0.8); color:white; padding:10px 20px; border-radius:10px; z-index:10000; font-size:0.8rem;";
        hint.innerHTML = "✨ Demo Mode Active (Backend Offline)";
        document.body.appendChild(hint);
        
        completeLogin(btn);
    }
}

function completeLogin(btn) {
    btn.innerHTML = `<i class='bx bx-check-circle'></i> Identity Verified`;
    btn.style.background = "var(--success)";
    btn.style.color = "white";
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

document.getElementById('googleBtn').addEventListener('click', (e) => {
    e.preventDefault();
    handleSocialLogin('google');
});

document.getElementById('githubBtn').addEventListener('click', (e) => {
    e.preventDefault();
    handleSocialLogin('github');
});
