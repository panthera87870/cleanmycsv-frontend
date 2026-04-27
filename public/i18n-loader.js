window.currentTranslations = {}; 
function getNestedValue(obj, path) {
    if (!path) return null;
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null;
    }, obj);
}

async function switchLanguage(lang) {
    localStorage.setItem('preferredLang', lang);
    document.documentElement.lang = lang;
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    try {
        const response = await fetch(`./locales/${lang}.json?v=${new Date().getTime()}`);
        if (!response.ok) throw new Error("Lang file not found");
        
        const translations = await response.json();
        window.currentTranslations = translations;
        applyTranslations(translations);

    } catch (error) {
        console.error("I18n Error:", error);
    }
}

function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = getNestedValue(translations, key);
        
        if (text) {
            if (el.tagName === 'META') el.setAttribute('content', text);
            else if (el.tagName === 'TITLE') document.title = text;
            else if (el.tagName === 'IMG') el.setAttribute('alt', text);
            else if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) el.setAttribute('placeholder', text);
            else el.innerHTML = text;
        }
    });

    document.querySelectorAll('[data-i18n-tooltip]').forEach(el => {
        const key = el.getAttribute('data-i18n-tooltip');
        const text = getNestedValue(translations, key);
        
        if (text) {
            el.setAttribute('data-tooltip', text);
        }
    });
}

window.t = function(key) {
    const val = getNestedValue(window.currentTranslations, key);
    return val || key; 
};

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchLanguage(this.getAttribute('data-lang'));
        });
    });

    const saved = localStorage.getItem('preferredLang');
    const browser = navigator.language.startsWith('fr') ? 'fr' : 'en';
    const langToLoad = saved || browser;

    switchLanguage(langToLoad);
});