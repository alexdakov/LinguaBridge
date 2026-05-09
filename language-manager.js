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
    ['en', 'bg', 'ru'].forEach(l => {
        const btn = document.querySelector(`.lang-btn-${l}`);
        if (!btn) return;
        if (l === lang) {
            btn.classList.add('bg-primary-container', 'text-white');
            btn.classList.remove('opacity-70', 'text-slate-600');
        } else {
            btn.classList.remove('bg-primary-container', 'text-white');
            btn.classList.add('opacity-70', 'text-slate-600');
        }
    });
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

// Boot on every page load
document.addEventListener('DOMContentLoaded', initLanguage);