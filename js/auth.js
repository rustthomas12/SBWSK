/**
 * Authentication Middleware for Client-side
 * Checks if user is logged in before allowing access to protected pages
 */

(function() {
    'use strict';

    // List of public pages that don't require authentication
    const publicPages = [
        'login.html',
        'signup.html',
        'verify-email.html',
        '/'  // Homepage might be public
    ];

    // Check if current page is public
    function isPublicPage() {
        const currentPath = window.location.pathname;
        return publicPages.some(page => currentPath.endsWith(page) || currentPath === '/');
    }

    // Check authentication status
    function checkAuth() {
        // Skip auth check for public pages
        if (isPublicPage()) {
            return;
        }

        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');

        if (!token || !user) {
            // User not logged in - redirect to login
            const currentPath = window.location.pathname + window.location.search;
            window.location.href = `login.html?redirect=${encodeURIComponent(currentPath)}`;
            return;
        }

        // Token exists - verify it's still valid (optional)
        // You could make an API call here to verify the token
    }

    // Get current user
    function getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Logout function
    function logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    // Display user info in navbar (if user is logged in)
    function displayUserInfo() {
        const user = getCurrentUser();
        if (!user) return;

        // Find nav menu and add user menu
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            const userMenuItem = document.createElement('li');
            userMenuItem.innerHTML = `
                <div class="user-menu" style="position: relative;">
                    <a href="#" id="userMenuToggle" style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                            ${user.name.charAt(0).toUpperCase()}
                        </span>
                        <span>${user.name}</span>
                    </a>
                    <div id="userDropdown" style="display: none; position: absolute; top: 100%; right: 0; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 200px; margin-top: 0.5rem; z-index: 1000;">
                        <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb;">
                            <p style="font-weight: 600; margin-bottom: 0.25rem;">${user.name}</p>
                            <p style="font-size: 0.875rem; color: var(--text-secondary);">${user.email}</p>
                        </div>
                        <a href="#" id="logoutBtn" style="display: block; padding: 0.75rem 1rem; color: #ef4444; text-decoration: none; border-radius: 0 0 8px 8px;">
                            Logout
                        </a>
                    </div>
                </div>
            `;
            navMenu.appendChild(userMenuItem);

            // Toggle user dropdown
            document.getElementById('userMenuToggle').addEventListener('click', (e) => {
                e.preventDefault();
                const dropdown = document.getElementById('userDropdown');
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });

            // Logout click handler
            document.getElementById('logoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                const userMenu = document.querySelector('.user-menu');
                if (userMenu && !userMenu.contains(e.target)) {
                    document.getElementById('userDropdown').style.display = 'none';
                }
            });
        }
    }

    // Run auth check when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            checkAuth();
            displayUserInfo();
        });
    } else {
        checkAuth();
        displayUserInfo();
    }

    // Make functions available globally
    window.auth = {
        getCurrentUser,
        logout,
        isAuthenticated: () => !!localStorage.getItem('authToken')
    };

})();
