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
        const isIndexPage = currentPath.endsWith('/') || currentPath.includes('index.html');
        
        if (!this.credentialsExist() && !isLoginPage) {
            // No credentials and not on login page - redirect to login
            window.location.href = 'pages/login.html';
        } else if (this.credentialsExist() && isLoginPage) {
            // Has credentials and on login page - redirect to home
            window.location.href = '../index.html';
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
        const togglePassword = document.getElementById('togglePassword');
        const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        const resetSection = document.getElementById('resetSection');
        const resetBtn = document.getElementById('resetBtn');

        const isNewUser = !auth.credentialsExist();

        if (isNewUser) {
            // First time user - show confirm password field
            confirmPasswordGroup.style.display = 'block';
            loginMessage.textContent = 'Set up your password to continue';
            submitBtn.textContent = 'Set Password';
            resetSection.style.display = 'none';
        } else {
            // Returning user - show login
            loginMessage.textContent = 'Enter your password to continue';
            submitBtn.textContent = 'Login';
            resetSection.style.display = 'block';
        }

        // Toggle password visibility
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                
                if (type === 'text') {
                    togglePassword.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    `;
                } else {
                    togglePassword.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    `;
                }
            });
        }

        // Toggle confirm password visibility
        if (toggleConfirmPassword) {
            toggleConfirmPassword.addEventListener('click', () => {
                const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
                confirmPasswordInput.type = type;
                
                if (type === 'text') {
                    toggleConfirmPassword.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    `;
                } else {
                    toggleConfirmPassword.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    `;
                }
            });
        }

        // Reset password functionality
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('⚠️ WARNING: This will delete your current password and all stored encrypted texts. You will need to set up a new password. Are you sure?')) {
                    // Clear credentials and stored texts
                    auth.clearCredentials();
                    localStorage.removeItem('encrypted_texts');
                    // Reload page to show setup screen
                    window.location.reload();
                }
            });
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
                window.location.href = '../index.html';
            } else {
                // Logging in with existing password
                const isValid = await auth.verifyPassword(password);
                
                if (isValid) {
                    window.location.href = '../index.html';
                } else {
                    errorMessage.textContent = 'Incorrect password';
                    passwordInput.value = '';
                }
            }
        });
    });
}

// Home page specific functionality
if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    document.addEventListener('DOMContentLoaded', () => {
        const logoutBtn = document.getElementById('logoutBtn');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    auth.clearCredentials();
                    window.location.href = 'pages/login.html';
                }
            });
        }
    });
}
