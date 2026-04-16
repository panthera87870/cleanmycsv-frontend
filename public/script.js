// --- INITIALISATION VERCEL ANALYTICS (CUSTOM EVENTS) SECURISEE ---
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

document.addEventListener('DOMContentLoaded', () => {
    // 1. Gestion du retour Stripe (sauvegarde du token)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        localStorage.setItem('mycsv_token', token); // On sauvegarde le sésame
        
        // Nettoyage de l'URL pour faire propre
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Petit message de succès (avec traduction si disponible)
        // On suppose que vous avez une fonction t() ou similaire, sinon simple alert
        alert("Paiement réussi ! Votre offre est active."); 
    }
});

// --- CONFIGURATION DES COOKIES (MODE MULTILINGUE) ---
window.addEventListener('load', () => {
    if (typeof CookieConsent !== 'undefined') {
        CookieConsent.run({
            guiOptions: {
                consentModal: {
                    layout: 'box',
                    position: 'bottom right',
                    equalWeightButtons: true
                }
            },
            categories: {
                necessary: { enabled: true, readOnly: true },
                analytics: { enabled: false, readOnly: false }
            },
            // Configuration automatique de la langue
            language: {
                default: 'fr',
                autoDetect: 'document', // Detecte la langue via <html lang="...">
                translations: {
                    fr: {
                        consentModal: {
                            title: 'Protection de votre vie privée',
                            description: 'Nous utilisons des cookies pour mesurer l\'audience et améliorer votre expérience sur CleanMyCSV. Ces données nous aident à optimiser nos outils de traitement de données.',
                            acceptAllBtn: 'Accepter l\'utilisation',
                            acceptNecessaryBtn: 'Continuer sans accepter',
                        }
                    },
                    en: {
                        consentModal: {
                            title: 'Privacy Protection',
                            description: 'We use cookies to measure audience and improve your experience on CleanMyCSV. This data helps us optimize our data processing tools.',
                            acceptAllBtn: 'Accept cookies',
                            acceptNecessaryBtn: 'Continue without accepting',
                        }
                    }
                }
            },
            onConsent: ({ cookie }) => {
                const status = cookie.categories.includes('analytics') ? 'granted' : 'denied';
                if (typeof gtag === 'function') {
                    gtag('consent', 'update', { 'analytics_storage': status });
                }
            }
        });
    }
});

const modalElement = document.getElementById('upload-modal');
const dynamicContentArea = document.getElementById('dynamic-content');

// --- FONCTION DE WARM-UP ---
(function wakeUpServer() {
    const BACKEND_URL = "https://cleanmycsv-backend-536004118248.europe-west1.run.app"; 
    fetch(`${BACKEND_URL}/wakeup`, { 
        method: 'GET',
        headers: {
            'X-Warmup-Key': 'warmup_cleanmyCSV_26_!'
        }
    });
})();

// --- GESTION DU GLISSER-DÉPOSER GLOBAL ---
function setupDragDropProtection() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
}

// --- UTILITAIRE TRONCATURE ---
function truncateFilename(filename, maxLength = 30) {
    if (filename.length <= maxLength) return filename;
    
    const MIN_END_CHARS = 5;
    const ellipsis = '...';
    const extensionMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
    const extension = extensionMatch ? extensionMatch[0] : '';
    const nameWithoutExt = extensionMatch ? filename.substring(0, filename.length - extension.length) : filename;
    const nameLength = nameWithoutExt.length;
    const availableNameLength = maxLength - extension.length - ellipsis.length;
    const endPartLength = Math.min(MIN_END_CHARS, nameLength - 1);
    const startPartLength = Math.max(1, availableNameLength - endPartLength);
    const startPart = nameWithoutExt.substring(0, startPartLength);
    const endPart = nameWithoutExt.substring(nameLength - endPartLength);

    return startPart + ellipsis + endPart + extension;
}

// --- GESTION DU CHARGEMENT DE LA PAGE ---
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. GESTION DES CLICS
    const openButtons = document.querySelectorAll('.js-open-modal');
    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    const closeBtn = document.querySelector('.js-close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    }

    // 2. SCROLL FIX
    setTimeout(function() {
        if (window.location.hash === "") {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, 0); 

    setupDragDropProtection();

    // --- TRACKING STRIPE AUTOMATIQUE (SANS TOUCHER AU HTML) ---
    const stripeLinks = document.querySelectorAll('a[href*="buy.stripe.com"]');
    stripeLinks.forEach(link => {
        link.addEventListener('click', () => {
            window.va('track', 'Click_Stripe_Checkout');
        });
    });
});

// Écouteur pour mettre à jour la modale si on change de langue alors qu'elle est ouverte
// (Fonctionne avec ton i18n-loader.js)
document.addEventListener('i18nReady', () => {
    // Si la modale est visible et qu'on est sur l'étape initiale (pas en succès/erreur), on rafraîchit
    if (modalElement.classList.contains('visible') && document.getElementById('upload-form')) {
        // On vérifie si un fichier était déjà sélectionné pour ne pas le perdre visuellement
        // Note: Pour faire simple, on reset ici, l'utilisateur devra remettre son fichier s'il switch la langue
        // C'est un compromis acceptable pour garder le code simple.
        resetModal();
    }
    
    // Mise à jour de la langue des cookies si possible (dépend de la lib)
    if (typeof CookieConsent !== 'undefined' && typeof CookieConsent.setLanguage === 'function') {
        CookieConsent.setLanguage(document.documentElement.lang);
    }
});

window.onload = function() {
    // On attend un peu que les trads chargent, sinon on lance avec les valeurs par défaut
    setTimeout(resetModal, 100); 
}

// --- Fonctions de défilement (Scroll) ---
function scrollToSection(event, sectionId) {
    event.preventDefault();
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
        const headerHeight = 80; 
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerHeight;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
}

// --- Fonctions de gestion de la modale ---
function openModal() {
    resetModal(); 
    modalElement.classList.add('visible');
}

function closeModal() {
    modalElement.classList.remove('visible');
    setTimeout(resetModal, 300);
}

function closeModalBtn() {
    closeModal();
}

// --- FONCTION PRINCIPALE : RESET MODAL (AVEC SÉLECTEUR LOGIQUE) ---
function resetModal() {
    // Utilisation de window.t() défini dans i18n-loader.js
    const t = window.t || ((k) => k);

    // 1. Détection de la langue pour le choix par défaut
    const currentLang = document.documentElement.lang || 'fr';
    const isFr = currentLang === 'fr';

    dynamicContentArea.innerHTML = `
        <h2>${t('modal.upload.main_title')}</h2>
        <div class="upload-step">
            <h3>${t('modal.upload.step_1')}</h3>
            
            <form id="upload-form" class="upload-area-wrapper" method="POST" action="https://cleanmycsv-backend-536004118248.europe-west1.run.app/clean-file" enctype="multipart/form-data">                
                <input type="file" id="csv-file" name="csv_file_to_clean" accept=".csv" required class="visually-hidden">
                
                <div class="upload-area">
                    <label for="csv-file" class="upload-label">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <p>${t('modal.upload.drag_drop_text')}</p>
                        <small>${t('modal.upload.supported_files')}</small>
                    </label>
                </div>

                <div class="logic-selector-container">
                    <span class="logic-title" style="font-weight:bold; margin-right:10px;">${t('modal.logic_title') || 'Format :'}</span>
                    
                    <div class="logic-group">
                        <label class="radio-label">
                            <input type="radio" name="cleaningLogic" value="fr" ${isFr ? 'checked' : ''}>
                            <span>${t('modal.logic_eu') || '🇪🇺 Europe'}</span>
                        </label>

                        <label class="radio-label">
                            <input type="radio" name="cleaningLogic" value="en" ${!isFr ? 'checked' : ''}>
                            <span>${t('modal.logic_us') || '🇺🇸 USA'}</span>
                        </label>
                    </div>

                    <div class="tooltip-wrapper" style="margin-left: 10px;">
                        <i class="fa-regular fa-circle-question info-icon"></i>
                        <span class="tooltip-text">${t('modal.logic_tooltip') || 'Info format...'}</span>
                    </div>
                </div>
                <button type="submit" class="cta-button start-clean-btn" disabled>
                    ${t('modal.upload.btn_start_disabled')}
                </button>
            </form>
        </div>
        <p class="security-note">
            <i class="fa-solid fa-lock"></i> ${t('modal.upload.security_note')}
        </p>
    `;
    
    setupFormListeners();
}

// --- Fonctions de téléchargement ---
function triggerDownload(url, publicName) {
    console.log('Téléchargement lancé pour :', publicName);
    const a = document.createElement('a');
    a.href = url; 
    a.download = publicName; 
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); }, 100);
}

// --- Gestion des Événements du Formulaire ---
function setupFormListeners() {
    const t = window.t || ((k) => k);
    console.log('--- Démarrage de setupFormListeners() ---');
    
    const currentFileInput = document.getElementById('csv-file');
    const currentUploadForm = document.getElementById('upload-form');
    const currentUploadArea = currentUploadForm?.querySelector('.upload-area');

    if (!currentFileInput || !currentUploadForm || !currentUploadArea) return;

    const currentUploadLabel = currentUploadForm.querySelector('.upload-label');
    const currentSubmitButton = currentUploadForm.querySelector('.start-clean-btn'); 

    // 1. Logique du Glisser-Déposer
    ['dragenter', 'dragover'].forEach(eventName => {
        currentUploadArea.addEventListener(eventName, (e) => {
            e.preventDefault(); e.stopPropagation();
            currentUploadArea.classList.add('highlight');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        currentUploadArea.addEventListener(eventName, (e) => {
            e.preventDefault(); e.stopPropagation();
            currentUploadArea.classList.remove('highlight');
        }, false);
    });

    currentUploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        e.preventDefault(); e.stopPropagation();
        const dt = e.dataTransfer;
        let file;

        if (dt.items) {
            for (let i = 0; i < dt.items.length; i++) {
                if (dt.items[i].kind === 'file' && dt.items[i].type === 'text/csv') {
                    file = dt.items[i].getAsFile();
                    break;
                }
            }
        } else {
            file = dt.files[0];
        }

        if (file) {
            if (!file.name.toLowerCase().endsWith('.csv')) {
                 alert(t('modal.upload.format_error'));
                 return;
            }
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            currentFileInput.files = dataTransfer.files;
            currentFileInput.dispatchEvent(new Event('change'));
        } else {
             alert(t('modal.upload.general_error'));
        }
    }

    // 2. Écouteur pour le changement de fichier
    currentFileInput.addEventListener('change', function() {
        if (currentFileInput.files.length > 0) {
            const originalName = currentFileInput.files[0].name;
            const truncatedName = truncateFilename(originalName, 30);
            
            currentSubmitButton.disabled = false;
            currentSubmitButton.textContent = t('modal.upload.btn_start_ready');
            
            currentUploadLabel.innerHTML = `
                <i class="fa-solid fa-file-csv icon-purple"></i>
                <p class="text-bold">${t('modal.upload.file_ready')} 
                    <strong>${truncatedName}</strong>
                </p>
                <small class="text-muted">${t('modal.upload.change_file')}</small>
            `;
        } else {
            currentSubmitButton.disabled = true;
            currentSubmitButton.textContent = t('modal.upload.btn_start_disabled');
            currentUploadLabel.innerHTML = `
                <i class="fa-solid fa-cloud-arrow-up icon-purple"></i>
                <p class="text-bold">${t('modal.upload.drag_drop_text')}</p>
                <small class="text-muted">${t('modal.upload.supported_files')}</small>
            `;   
        }
    });

    // 3. Soumission
    currentUploadForm.addEventListener('submit', handleFormSubmit);
}

// --- Logique de Soumission (AJAX) ---
async function handleFormSubmit(e) {
    e.preventDefault();
    const t = window.t || ((k) => k);
    const form = e.currentTarget;

    if (typeof gtag === 'function') {
        gtag('event', 'start_cleaning', { 'event_category': 'Engagement', 'event_label': 'CSV Upload' });
    }
    // NOUVEAU : Envoi de l'événement à Vercel Analytics
    window.va('track', 'Clean_Action_Started');

    dynamicContentArea.innerHTML = `
        <div class="modal-center-view">
            <h2>${t('modal.processing.title')}</h2>
            <p class="text-muted">${t('modal.processing.sending')}</p>
            
            <div class="progress-container" style="width: 100%; max-width: 80%; height: 8px; background: var(--color-info-bg, #f9f9f9); border-radius: 10px; margin: 25px auto; overflow: hidden; position: relative; border: 1px solid var(--color-border, #ddd);">
                <div class="progress-bar" style="height: 100%; background: linear-gradient(90deg, var(--blue, #52c6ff), var(--purple, #8c52ff)); width: 0%; border-radius: 10px; animation: fakeProgress 10s cubic-bezier(0.1, 0.7, 0.1, 1) forwards;"></div>
            </div>
            <style>
                @keyframes fakeProgress {
                    0% { width: 0%; }
                    20% { width: 40%; }
                    60% { width: 75%; }
                    95% { width: 95%; }
                    100% { width: 99%; }
                }
            </style>

            <p class="text-muted-small"><i class="fa-solid fa-clock"></i> ${t('modal.processing.wait')}</p>
        </div>
    `;
    
    const formData = new FormData(form);
    
    try {
        const selectedLogic = formData.get('cleaningLogic') || document.documentElement.lang || 'fr';
        
        // --- NOUVEAU : Préparation de la requête avec le Token ---
        const token = localStorage.getItem('mycsv_token');
        const fetchOptions = {
            method: 'POST',
            body: formData,
            headers: {} // On initialise les headers vides
        };

        // Si l'utilisateur a un token valide en stock, on l'ajoute
        if (token) {
            fetchOptions.headers['X-Access-Token'] = token;
        }
        
        // --- FIN NOUVEAU ---

        // On utilise nos fetchOptions préparées juste au-dessus
        const response = await fetch(`${form.action}?lang=${selectedLogic}`, fetchOptions);
        const data = await response.json();

        if (!response.ok) {
            // NOUVEAU RÉFLEXE : Si c'est un problème de limite (Poids ou Nombre), on déclenche le Paywall direct !
            if (response.status === 402 || data.code === 'LIMIT_REACHED' || data.code === 'FILE_TOO_LARGE_FREE') {
                displaySuccessView(data, true, data.code);
                return; // On arrête l'exécution classique et on affiche le teaser
            }

            // Pour toutes les VRAIES autres erreurs (panne serveur, etc.)
            throw new Error(data.message || `Erreur Serveur: ${response.status}`);
        }

        if (data.success) {
            // Succès normal : isPaywall = false
            displaySuccessView(data, false);
        }
    } catch (error) {
        console.error('Erreur Critique:', error);
        displayErrorView(error.message);
    }
}

/**
 * Génère le HTML pour la preview en mode "Split View" (Côte à Côte)
 */
function generatePreviewHTML(previewRows, t) {
    if (!previewRows || previewRows.length === 0) return '';

    // Sécurisation de la traduction
    const safeT = (key, fallback) => {
        const val = t ? t(key) : key;
        return (val && val !== key) ? val : fallback;
    };

    const txtOriginal = safeT('preview.original_label', 'Fichier Original');
    const txtCleaned = safeT('preview.cleaned_label', 'Fichier Nettoyé');

    // --- PRÉPARATION DES HEADERS ---
    // On prend les headers du fichier nettoyé pour les deux côtés pour simplifier l'alignement
    let headerHTML = '';
    if (previewRows.length > 0) {
        headerHTML += '<tr>';
        previewRows[0].cleaned.forEach(col => {
            headerHTML += `<th>${col}</th>`;
        });
        headerHTML += '</tr>';
    }

    // --- GÉNÉRATION DU TABLEAU GAUCHE (ORIGINAL) ---
    let leftBody = '';
    for (let i = 1; i < previewRows.length; i++) {
        leftBody += '<tr>';
        previewRows[i].original.forEach(val => {
            // Si undefined ou null, on met vide
            leftBody += `<td>${val || ''}</td>`;
        });
        leftBody += '</tr>';
    }

    // --- GÉNÉRATION DU TABLEAU DROIT (NETTOYÉ + COULEURS) ---
    let rightBody = '';
    for (let i = 1; i < previewRows.length; i++) {
        const rowData = previewRows[i];
        rightBody += '<tr>';
        
        // On boucle sur les colonnes 'cleaned'
        rowData.cleaned.forEach((valClean, index) => {
            const valOrig = rowData.original[index]; // On récupère la valeur correspondante
            
            // Comparaison (attention aux types, on cast en string pour être sûr)
            const strClean = String(valClean || '');
            const strOrig = String(valOrig || '');
            
            // Si différent, on ajoute la classe CSS 'cell-diff'
            const isDiff = strClean !== strOrig;
            const cssClass = isDiff ? 'cell-diff' : '';
            
            rightBody += `<td class="${cssClass}">${strClean}</td>`;
        });
        rightBody += '</tr>';
    }

    // --- ASSEMBLAGE FINAL DU HTML ---
    return `
    <div class="preview-wrapper animate-fade-in">
        <div class="split-view-container">
            
            <div class="split-pane pane-original">
                <div class="pane-header header-original">
                    <i class="fa-regular fa-file"></i> ${txtOriginal}
                </div>
                <div class="table-scroll-wrapper">
                    <table class="split-table">
                        <thead>${headerHTML}</thead>
                        <tbody>${leftBody}</tbody>
                    </table>
                </div>
            </div>

            <div class="split-pane pane-cleaned">
                <div class="pane-header header-cleaned">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> ${txtCleaned}
                </div>
                <div class="table-scroll-wrapper">
                    <table class="split-table">
                        <thead>${headerHTML}</thead>
                        <tbody>${rightBody}</tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>`;
}
function displaySuccessView(data, isPaywall = false, reasonCode = null) {
    const t = (key) => {
        if (window.translations && window.currentLang) {
            const keys = key.split('.');
            let val = window.translations[window.currentLang];
            for (const k of keys) {
                if (val !== undefined && val !== null) val = val[k];
            }
            if (typeof val === 'string') return val;
        }
        return window.t ? window.t(key) : key;
    };
    
    // --- 1. GÉNÉRATION DU BEAU TABLEAU (La seule nouveauté) ---
    let theadHTML = '';
    let tbodyHTML = '';
    const preview = data.preview;

    if (preview && preview.length > 0) {
        const MAX_COLS = 5; 
        const cleanHeaders = preview[0].cleaned;
        const origHeaders = preview[0].original;
        const origHeadersNormalized = origHeaders.map(h => (h || '').toString().trim().toLowerCase());
        const headersToShow = cleanHeaders.slice(0, MAX_COLS);
        const hasMoreCols = cleanHeaders.length > MAX_COLS;

        theadHTML = '<tr>';
        headersToShow.forEach(h => {
            theadHTML += `<th>${h || 'Colonne'}</th>`;
        });
        if (hasMoreCols) theadHTML += '<th class="col-fade">...</th>';
        theadHTML += '</tr>';

        const rowsToShow = preview.slice(1, 4);
        rowsToShow.forEach(row => {
            tbodyHTML += '<tr>';
            headersToShow.forEach((cleanHeader, index) => {
                const cleanCell = row.cleaned[index];
                const cleanHeaderNormalized = (cleanHeader || '').toString().trim().toLowerCase();
                const origIndex = origHeadersNormalized.indexOf(cleanHeaderNormalized);
                
                let isFixed = false;
                let origCell = "";

                if (origIndex === -1) {
                    isFixed = true;
                    origCell = t('teaser.new_column') || "Donnée ajoutée";
                } else {
                    origCell = row.original[origIndex];
                    isFixed = cleanCell !== origCell;
                }

                if (isFixed) {
                    tbodyHTML += `<td class="cell-fixed" title="Original: ${origCell}">${cleanCell || '-'} ✨</td>`;
                } else {
                    tbodyHTML += `<td>${cleanCell || '-'}</td>`;
                }
            });
            if (hasMoreCols) tbodyHTML += '<td class="col-fade">...</td>';
            tbodyHTML += '</tr>';
        });

        // Effet de flou si paywall
        if (isPaywall) {
            tbodyHTML += '<tr class="row-blurred">';
            headersToShow.forEach(() => tbodyHTML += `<td>données protégées</td>`);
            if (hasMoreCols) tbodyHTML += '<td class="col-fade">...</td>';
            tbodyHTML += '</tr>';
        }
    }

    // --- 2. CONSTRUCTION DE TON ANCIENNE PAGE ---
    const title = isPaywall ? t('teaser.title') : t('modal.success.title');
    
    let html = `<div class="modal-center-view success-view">`;
    html += `<h2>${title}</h2>`;

    if (isPaywall) {
        const subtitleKey = reasonCode === 'FILE_TOO_LARGE_FREE' ? t('teaser.subtitle_size') : t('teaser.subtitle_limit');
        html += `<p class="teaser-alert" style="color: var(--color-danger); font-weight: bold; margin-bottom: 15px;">${subtitleKey}</p>`;
    } else {
        html += `<p class="text-muted">${t('modal.success.subtitle')}</p>`;
    }

    // A. TON RÉSUMÉ HUMAIN (Exactement comme avant)
    const summaryText = data.summary && data.summary.humanSummary ? data.summary.humanSummary : (data.summary || '');
    html += `
        <div class="report-container" style="background: var(--color-info-bg); border: 1px solid var(--color-border); border-radius: 8px; padding: 15px; margin: 20px 0; text-align: left; font-size: 0.9em;">
            ${summaryText}
        </div>
    `;

    // B. LE TABLEAU (Inséré au milieu)
    html += `
        <div class="teaser-table-wrapper">
            <table class="teaser-table-modern">
                <thead>${theadHTML}</thead>
                <tbody>${tbodyHTML}</tbody>
            </table>
    `;
    if (isPaywall) {
        html += `
            <div class="paywall-gradient">
                <i class="fa-solid fa-lock" style="font-size: 24px; color: var(--deeper-purple); margin-bottom: 10px;"></i>
            </div>
        `;
    }
    html += `</div>`; // Fin du tableau

    // C. LES BOUTONS (Stripe OU Téléchargement classique)
    if (isPaywall) {
        html += `<p class="text-muted mb-20" style="text-align: center;">${t('teaser.hook')}</p>`;
        html += `
            <div class="action-buttons teaser-pricing" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 15px;">
                <a href="https://buy.stripe.com/28EfZj9TJ1kQ2rl9hhfAc01" class="btn-secondary" style="flex: 1; min-width: 120px; text-align: center;">9€ - ${t('teaser.btn_single')}</a>
                <a href="https://buy.stripe.com/bJe4gBgi7gfK7LFdxxfAc02" class="cta-button" style="flex: 1; min-width: 120px; text-align: center;">29€ - ${t('teaser.btn_24h')}</a>
                <a href="https://buy.stripe.com/14A28t5Dte7C3vp511fAc03" class="btn-secondary" style="flex: 1; min-width: 120px; text-align: center;">99€ - ${t('teaser.btn_life')}</a>
            </div>
        `;
    } else {
        // Un seul bouton, on ajoute un id "btn-text" pour cibler le texte facilement
        html += `
            <div class="download-section mt-20" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                <div style="margin-bottom: 20px; text-align: center;">
                    <label style="cursor: pointer; font-size: 0.95em; color: var(--deeper-purple); font-weight: 600;">
                        <input type="checkbox" id="want-json"> ${t('modal.success.checkbox_json')}
                    </label>
                </div>
                
                <button class="cta-button" id="btn-download-main" style="width: 100%; max-width: 300px; display: flex; justify-content: center; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-download"></i> <span id="btn-text">${t('modal.success.btn_download_csv')}</span>
                </button>
            </div>
        `;
    }

    html += `</div>`;
    dynamicContentArea.innerHTML = html;

    // --- 3. ÉCOUTEURS D'ÉVÉNEMENTS ---
    if (!isPaywall) {
        const chkJson = document.getElementById('want-json');
        const btnDownloadMain = document.getElementById('btn-download-main');
        const btnText = document.getElementById('btn-text');
        
        // Variable pour suivre l'étape du téléchargement si le JSON est coché
        let downloadStep = 1;

        // Événement 1 : Quand on coche/décoche la case JSON
        if (chkJson && btnText) {
            chkJson.addEventListener('change', (e) => {
                if (e.target.checked) {
                    btnText.innerHTML = `${t('modal.success.btn_download_csv')} (1/2)`;
                    downloadStep = 1; // On reset l'étape au cas où l'utilisateur joue avec la case
                } else {
                    btnText.innerHTML = `${t('modal.success.btn_download_csv')}`;
                }
            });
        }

        // Événement 2 : Au clic sur le bouton principal
        if (btnDownloadMain) {
            btnDownloadMain.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Si le bouton est désactivé (en cours de cooldown), on ne fait rien
                if (btnDownloadMain.disabled) return;
                
                if (chkJson && chkJson.checked) {
                    // MODE DEUX ÉTAPES (CSV puis JSON)
                    if (downloadStep === 1) {
                        
                        // 1. On bloque immédiatement le bouton pour empêcher le double-clic
                        btnDownloadMain.disabled = true;
                        btnDownloadMain.style.opacity = '0.7';
                        btnDownloadMain.style.cursor = 'wait';
                        
                        // 2. Feedback visuel : on indique que ça prépare
                        btnText.innerHTML = `Préparation... <i class="fa-solid fa-spinner fa-spin" style="margin-left: 8px;"></i>`;
                        
                        // 3. On lance le téléchargement du CSV
                        triggerDownload(data.downloadUrl, data.downloadName);
                        
                        // 4. On force une pause (1.5 secondes) avant de débloquer l'étape 2
                        setTimeout(() => {
                            const jsonText = t('modal.success.btn_download_json') || 'Télécharger le rapport JSON';
                            btnText.innerHTML = `${jsonText} (2/2)`;
                            
                            // On réactive le bouton pour le deuxième clic
                            btnDownloadMain.disabled = false;
                            btnDownloadMain.style.opacity = '1';
                            btnDownloadMain.style.cursor = 'pointer';
                            
                            downloadStep = 2; // On autorise l'étape suivante
                        }, 1500); // Tu peux ajuster ce délai (1500 = 1,5s)
                        
                    } else if (downloadStep === 2) {
                        // Étape 2/2 : On télécharge le JSON
                        triggerDownload(data.reportDownloadUrl, data.reportDownloadName);
                        
                        // C'est fini, on passe à l'écran de fin
                        setTimeout(() => {
                            if (typeof displayPostDownloadView === 'function') {
                                displayPostDownloadView();
                            }
                        }, 500);
                    }
                } else {
                    // MODE CLASSIQUE (Seulement le CSV)
                    triggerDownload(data.downloadUrl, data.downloadName);
                    setTimeout(() => {
                        if (typeof displayPostDownloadView === 'function') {
                            displayPostDownloadView();
                        }
                    }, 500);
                }
            });
        }
    }
}

function displayErrorView(errorMessage) {
    const t = window.t || ((k) => k);
    dynamicContentArea.innerHTML = `
        <div class="modal-center-view">
            <i class="fa-solid fa-triangle-exclamation icon-danger-lg"></i>
            <h2 class="modal-title">${t('modal.error.title')}</h2>
            <p class="text-muted mb-15">${t('modal.error.prefix')} <strong>${errorMessage}</strong></p>
            <button id="btn-error-retry" class="cta-button btn-secondary">
                ${t('modal.error.btn_retry')}
            </button>
        </div>`;
    
    const retryBtn = document.getElementById('btn-error-retry');
    if (retryBtn) retryBtn.addEventListener('click', closeModal);
}

function displayPostDownloadView() {
    const t = window.t || ((k) => k);
    dynamicContentArea.innerHTML = `
        <div class="final-success-view">
            <i class="fa-solid fa-circle-check main-icon"></i>
            
            <h2>${t('modal.post_download.title')}</h2>
            <p>${t('modal.post_download.desc')}</p>
            
            <div class="action-buttons">
                <button id="btn-finish-home" class="btn-secondary">
                    <i class="fa-solid fa-house"></i> ${t('modal.post_download.btn_finish')}
                </button>

                <button id="btn-new-clean" class="cta-button-again">
                    <i class="fa-solid fa-rotate-right"></i> ${t('modal.post_download.btn_again')}
                </button>
            </div>
            
            <div class="text-muted-small mt-20">
                ${t('modal.post_download.security_delete')}
            </div>
        </div>
    `;

    const finishBtn = document.getElementById('btn-finish-home');
    if (finishBtn) finishBtn.addEventListener('click', closeModal);

    const restartBtn = document.getElementById('btn-new-clean');
    if (restartBtn) restartBtn.addEventListener('click', resetModal);
}

// --- HEADER SCROLL ---
function setupHeaderScroll() {
    const header = document.querySelector('.main-header');
    let ticking = false;
    if (header) {
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 50) header.classList.add('scrolled');
                    else header.classList.remove('scrolled');
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
}
setupHeaderScroll();