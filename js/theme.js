// theme.js — Dark/Light mode toggle
(function() {
    const STORAGE_KEY = 'rb_theme';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
            btn.innerHTML = theme === 'dark'
                ? '<i data-lucide="sun"></i>'
                : '<i data-lucide="moon"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark');
    }

    // Restore saved preference immediately to prevent flash
    const saved = localStorage.getItem(STORAGE_KEY) || 'light';
    applyTheme(saved);

    // Export globally
    window.rbTheme = { toggle: toggleTheme, apply: applyTheme };
})();
