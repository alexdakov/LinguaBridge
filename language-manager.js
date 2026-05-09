// ─── LANGUAGE MANAGER ────────────────────────────────────────────────────────
// Single source of truth for all translation logic.
// Called by switcher buttons via onclick="changeGlobalLanguage('xx')"
// ─────────────────────────────────────────────────────────────────────────────

let _translations = {};

// Load translations.json once, then apply saved / default language
async function initLanguage() {
    try {
        const res = await fetch('./translations.json');
        _translations = await res.json();
    } catch (e) {
        console.error('Could not load translations.json:', e);
        return;
    }
    const lang = localStorage.getItem('preferredLang') || 'en';
    applyLanguage(lang);
}

// Apply a language: swap all [data-i18n] text + update switcher UI
function applyLanguage(lang) {
    if (!_translations[lang]) {
        console.warn(`No translations found for "${lang}"`);
        return;
    }

    localStorage.setItem('preferredLang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const value = _translations[lang][key];
        if (value === undefined) return;
        el.innerHTML = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const value = _translations[lang][key];
        if (value === undefined) return;
        el.placeholder = value;
    });

    updateSwitcherUI(lang);
}

// Highlight the active button, dim the others
function updateSwitcherUI(lang) {
    ['en', 'bg', 'ru', 'zh'].forEach(l => {
        document.querySelectorAll(`.lang-btn-${l}`).forEach(btn => {
            if (l === lang) {
                btn.classList.add('bg-primary-container', 'text-white');
                btn.classList.remove('opacity-70', 'text-slate-600');
            } else {
                btn.classList.remove('bg-primary-container', 'text-white');
                btn.classList.add('opacity-70', 'text-slate-600');
            }
        });
    });

    // Update current-language flag in the globe button
    const flagMap = { en: 'gb', bg: 'bg', ru: 'ru', zh: 'cn' };
    const flagEl = document.getElementById('lang-current-flag');
    if (flagEl) {
        flagEl.src = `https://flagcdn.com/w40/${flagMap[lang] || 'gb'}.png`;
        flagEl.alt = lang.toUpperCase();
    }
}

// Public function — called by onclick on every page that uses the switcher
async function changeGlobalLanguage(lang) {
    // If translations haven't loaded yet (edge case), load them first
    if (!Object.keys(_translations).length) {
        try {
            const res = await fetch('./translations.json');
            _translations = await res.json();
        } catch (e) {
            console.error('Could not load translations.json:', e);
            return;
        }
    }
    applyLanguage(lang);

    // Re-render dynamic JS content that depends on language
    if (typeof renderEnrolForm === 'function' && document.getElementById('enrolment-form-container')) {
        renderEnrolForm(lang);
    }
    if (typeof renderTutorForm === 'function' && document.getElementById('tutor-form-container')) {
        renderTutorForm(lang);
    }
    if (typeof renderCatalog === 'function' && document.getElementById('catalog-container')) {
        renderCatalog();
    }
}

// Mobile nav toggle
function toggleMobileMenu(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('mobile-menu');
    const langDrop = document.getElementById('mobile-lang-dropdown');
    if (menu) {
        menu.classList.toggle('hidden');
        if (langDrop) langDrop.classList.add('hidden');
    }
}

function toggleMobileLang(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('mobile-lang-dropdown');
    const menu = document.getElementById('mobile-menu');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
        if (menu) menu.classList.add('hidden');
    }
}

function closeMobileLang() {
    document.getElementById('mobile-lang-dropdown')?.classList.add('hidden');
}

document.addEventListener('click', function(e) {
    const langBtn = document.getElementById('mobile-lang-btn');
    const langDrop = document.getElementById('mobile-lang-dropdown');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (langDrop && !langDrop.classList.contains('hidden') &&
        !langBtn?.contains(e.target) && !langDrop?.contains(e.target)) {
        langDrop.classList.add('hidden');
    }
    if (menu && !menu.classList.contains('hidden') &&
        !menuBtn?.contains(e.target) && !menu?.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

// Boot on every page load
document.addEventListener('DOMContentLoaded', initLanguage);