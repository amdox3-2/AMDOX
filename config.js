const CONFIG = {
    // API_BASE_URL: 'http://127.0.0.1:3000/api' // Local
    API_BASE_URL: 'https://amdox-backend.onrender.com/api' // Example Production (User will need to deploy backend)
};

// Check if running on localhost to auto-switch
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    CONFIG.API_BASE_URL = 'http://127.0.0.1:3000/api';
}

window.APP_CONFIG = CONFIG;
