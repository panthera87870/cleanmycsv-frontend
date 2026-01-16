// ==============================================
// I18N-LOADER.JS - Version "Event Driven"
// ==============================================

window.currentTranslations = {}; // Stockage global

async function switchLanguage(lang) {
    localStorage.setItem('preferredLang', lang);
    document.documentElement.lang = lang;
    
    // Gestion visuelle des boutons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Détermine le nom de la page (ex: "contact", "index")
    let page = window.location.pathname.split("/").pop().replace(".html", "") || "index";
    if(page === "") page = "index";

    try {
        // Chargement du JSON
        const response = await fetch(`./locales/${lang}/${page}.json?v=${new Date().getTime()}`); // Cache busting léger
        if (!response.ok) throw new Error("Lang file not found");
        
        const translations = await response.json();
        
        // 1. On stocke pour le JS
        window.currentTranslations = translations;
        
        // 2. On applique au HTML
        applyTranslations(translations);

        // 3. IMPORTANT : On prévient script.js que c'est prêt !
        document.dispatchEvent(new CustomEvent('i18nReady', { detail: { lang: lang } }));

    } catch (error) {
        console.error("I18n Error:", error);
    }
}

function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = translations[key];
        if (text) {
            if (el.tagName === 'META') el.setAttribute('content', text);
            else if (el.tagName === 'TITLE') document.title = text;
            else if (el.tagName === 'IMG') el.setAttribute('alt', text);
            else if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) el.setAttribute('placeholder', text);
            else el.innerHTML = text;
        }
    });
}

// Helper global pour script.js
window.t = function(key) {
    return window.currentTranslations[key] || key; // Renvoie la clé si pas de trad
};

// Démarrage
document.addEventListener('DOMContentLoaded', () => {
    // Clics sur les drapeaux
    const buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            switchLanguage(this.getAttribute('data-lang'));
        });
    });

    // Chargement initial
    const saved = localStorage.getItem('preferredLang');
    const browser = navigator.language.startsWith('fr') ? 'fr' : 'en';
    switchLanguage(saved || browser);
});