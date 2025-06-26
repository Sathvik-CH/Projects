// auth.js

// Backend API URL
const API_URL = 'http://localhost:5000/api'; // Replace with your actual backend URL if deployed

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const input = toggle.previousElementSibling;
        input.type = input.type === 'password' ? 'text' : 'password';
    });
});

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login successful!');
            // Assuming 'userId' is retrieved from the login response
            localStorage.setItem('userId', userId);

            localStorage.setItem('token', data.token); // Store the JWT token
            window.location.href = 'index.html'; // Redirect to the home page after login
        } else {
            alert(data.message); // Show error message from the server
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Login failed. Please try again later.');
    }
});

// Handle sign-up form submission
document.getElementById('signupForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Sign-up successful! Please log in.');
            window.location.href = 'login.html'; // Redirect to login page
        } else {
            alert(data.message); // Show error message from the server
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Sign-up failed. Please try again later.');
    }
});

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('token');
    return token !== null;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    alert('Logged out successfully.');
    window.location.href = 'login.html'; // Redirect to login page
}

// Protect certain pages (not login.html or signup.html)
const protectedPages = ['/index.html', '/services.html', '/telemedicine.html', '/bookingappointment.html'];

if (protectedPages.includes(window.location.pathname)) {
    if (!isAuthenticated()) {
        alert('You need to log in to access this page.');
        window.location.href = 'login.html'; // Redirect to login if not authenticated
    }
}
