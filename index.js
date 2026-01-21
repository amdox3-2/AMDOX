const container = document.getElementById('container');
const registerBtn = document.getElementById('registerBtn');
const loginBtn = document.getElementById('loginBtn');
const roleSelect = document.querySelector('.role-select');
const resumeUploadWrap = document.getElementById('resume-upload-wrap');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

roleSelect.addEventListener('change', () => {
    if (roleSelect.value === 'seeker') {
        resumeUploadWrap.style.display = 'block';
    } else {
        resumeUploadWrap.style.display = 'none';
    }
});

function toggle(id, icon) {
    const input = document.getElementById(id);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace('bx-hide', 'bx-show');
    } else {
        input.type = "password";
        icon.classList.replace('bx-show', 'bx-hide');
    }
}

// Handle Sign Up Form Submission
document.querySelector('.sign-up form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const password = document.getElementById('regPass').value;
    const role = this.querySelector('.role-select').value;

    if (!role) {
        alert('Please select a role to register.');
        return;
    }

    try {
        // Register user via API
        const response = await fetch('http://127.0.0.1:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });

        const result = await response.json();

        if (!result.success) {
            alert(result.message || 'Registration failed');
            return;
        }

        // Store user info in sessionStorage for profile creation
        sessionStorage.setItem('currentUser', JSON.stringify(result.data));

        // Handle resume upload for seekers
        if (role === 'seeker') {
            const resumeFile = document.getElementById('resume-upload').files[0];
            if (resumeFile) {
                const formData = new FormData();
                formData.append('resume', resumeFile);

                try {
                    const uploadResponse = await fetch('http://127.0.0.1:3000/api/upload/resume', {
                        method: 'POST',
                        body: formData
                    });

                    const uploadResult = await uploadResponse.json();
                    if (uploadResult.success) {
                        sessionStorage.setItem('resumeInfo', JSON.stringify(uploadResult.data));
                    }
                } catch (uploadError) {
                    console.error('Resume upload error:', uploadError);
                }
            }
        }

        // Redirect to appropriate profile page
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
});

// Handle Sign In Form Submission
document.querySelector('.sign-in form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    const password = document.getElementById('logPass').value;

    try {
        const response = await fetch('http://127.0.0.1:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!result.success) {
            alert(result.message || 'Invalid credentials');
            return;
        }

        // Store user info in sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(result.data));

        // Redirect based on role
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
});

