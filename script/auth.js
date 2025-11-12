// Authentication and security utilities
class Auth {
    constructor() {
        this.STORAGE_KEY = 'user_credentials';
    }

    // Hash password using SHA-256
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return this.bufferToHex(hash);
    }

    // Convert buffer to hex string
    bufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Check if credentials exist in local storage
    credentialsExist() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }

    // Save hashed password to local storage
    async saveCredentials(password) {
        const hashedPassword = await this.hashPassword(password);
        localStorage.setItem(this.STORAGE_KEY, hashedPassword);
    }

    // Verify password against stored hash
    async verifyPassword(password) {
        const hashedPassword = await this.hashPassword(password);
        const storedHash = localStorage.getItem(this.STORAGE_KEY);
        return hashedPassword === storedHash;
    }

    // Clear credentials (logout)
    clearCredentials() {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    // Check authentication and redirect if needed
    checkAuth() {
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('login.html');
        
        if (!this.credentialsExist() && !isLoginPage) {
            // No credentials and not on login page - redirect to login
            window.location.href = 'login.html';
        } else if (this.credentialsExist() && isLoginPage) {
            // Has credentials and on login page - redirect to home
            window.location.href = 'home.html';
        }
    }
}

// Initialize auth instance
const auth = new Auth();

// Run auth check on every page load
document.addEventListener('DOMContentLoaded', () => {
    auth.checkAuth();
});

// Login page specific functionality
if (window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const loginForm = document.getElementById('loginForm');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
        const loginMessage = document.getElementById('loginMessage');
        const submitBtn = document.getElementById('submitBtn');
        const errorMessage = document.getElementById('errorMessage');

        const isNewUser = !auth.credentialsExist();

        if (isNewUser) {
            // First time user - show confirm password field
            confirmPasswordGroup.style.display = 'block';
            loginMessage.textContent = 'Set up your password to continue';
            submitBtn.textContent = 'Set Password';
        } else {
            // Returning user - show login
            loginMessage.textContent = 'Enter your password to continue';
            submitBtn.textContent = 'Login';
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessage.textContent = '';

            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (isNewUser) {
                // Setting up new password
                if (password.length < 6) {
                    errorMessage.textContent = 'Password must be at least 6 characters long';
                    return;
                }

                if (password !== confirmPassword) {
                    errorMessage.textContent = 'Passwords do not match';
                    return;
                }

                // Save new password
                await auth.saveCredentials(password);
                window.location.href = 'home.html';
            } else {
                // Logging in with existing password
                const isValid = await auth.verifyPassword(password);
                
                if (isValid) {
                    window.location.href = 'home.html';
                } else {
                    errorMessage.textContent = 'Incorrect password';
                    passwordInput.value = '';
                }
            }
        });
    });
}

// Home page specific functionality
if (window.location.pathname.includes('home.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const logoutBtn = document.getElementById('logoutBtn');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    auth.clearCredentials();
                    window.location.href = 'login.html';
                }
            });
        }
    });
}
