// --- INITIALISATION VERCEL ANALYTICS (CUSTOM EVENTS) SECURISEE ---
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };

/**
 * FONCTION DE SÉCURISATION XSS (CHIRURGICALE)
 * Remplace les caractères sensibles par des entités HTML.
 */
const sanitize = (str) => {
    if (!str && str !== 0) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return String(str).replace(reg, (match) => map[match]);
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Gestion du retour Stripe (sauvegarde du token)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        localStorage.setItem('mycsv_token', token); 
        window.history.replaceState({}, document.title, window.location.pathname);
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
                    equalWeightButtons: false
                }
            },
            categories: {
                necessary: { enabled: true, readOnly: true },
                analytics: { enabled: false, readOnly: false }
            },
            language: {
                default: 'fr',
                autoDetect: 'document', 
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
        headers: { 'X-Warmup-Key': 'warmup_cleanmyCSV_26_!' }
    });
})();

// --- GESTION DU GLISSER-DÉPOSER GLOBAL ---
function setupDragDropProtection() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
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

    setTimeout(function() {
        if (window.location.hash === "") {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, 0); 

    setupDragDropProtection();

    const stripeLinks = document.querySelectorAll('a[href*="buy.stripe.com"]');
    stripeLinks.forEach(link => {
        link.addEventListener('click', () => {
            window.va('track', 'Click_Stripe_Checkout');
        });
    });
});

document.addEventListener('i18nReady', () => {
    if (modalElement.classList.contains('visible') && document.getElementById('upload-form')) {
        resetModal();
    }
    if (typeof CookieConsent !== 'undefined' && typeof CookieConsent.setLanguage === 'function') {
        CookieConsent.setLanguage(document.documentElement.lang);
    }
});

window.onload = function() {
    setTimeout(resetModal, 100); 
}

function scrollToSection(event, sectionId) {
    event.preventDefault();
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
        const headerHeight = 80; 
        const offsetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
}

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

// --- FONCTION PRINCIPALE : RESET MODAL ---
function resetModal() {
    const t = window.t || ((k) => k);
    const currentLang = document.documentElement.lang || 'fr';
    const isFr = currentLang === 'fr';

    dynamicContentArea.innerHTML = `
        <h2>${t('modal.upload.main_title')}</h2>
        <div class="upload-step">
            <h3>${t('modal.upload.step_1')}</h3>
            <form id="upload-form" class="upload-area-wrapper" method="POST" action="https://cleanmycsv-backend-536004118248.europe-west1.run.app/clean-file" enctype="multipart/form-data">                
                <input type="file" id="csv-file" name="csv_file_to_clean" accept=".csv" required class="modal-visually-hidden">
                <div class="upload-area">
                    <label for="csv-file" class="upload-label">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <p>${t('modal.upload.drag_drop_text')}</p>
                        <small>${t('modal.upload.supported_files')}</small>
                    </label>
                </div>
                <div class="upload-logic-container">
                    <span class="upload-logic-title">${t('modal.logic_title') || 'Format :'}</span>
                    <div class="upload-logic-group">
                        <label class="upload-radio-label">
                            <input type="radio" name="cleaningLogic" value="fr" ${isFr ? 'checked' : ''}>
                            <span>${t('modal.logic_eu') || '🇪🇺 Europe'}</span>
                        </label>
                        <label class="upload-radio-label">
                            <input type="radio" name="cleaningLogic" value="en" ${!isFr ? 'checked' : ''}>
                            <span>${t('modal.logic_us') || '🇺🇸 USA'}</span>
                        </label>
                    </div>
                    <div class="upload-tooltip-wrapper">
                        <i class="fa-regular fa-circle-question upload-tooltip-icon"></i>
                        <span class="upload-tooltip-text">${t('modal.logic_tooltip') || 'Info format...'}</span>
                    </div>
                </div>
                <button type="submit" id="upload-submit-btn" class="cta-button upload-btn-submit" disabled>
                    ${t('modal.upload.btn_start_disabled')}
                </button>
            </form>
        </div>
        <p class="upload-security-note"><i class="fa-solid fa-lock"></i> ${t('modal.upload.security_note')}</p>
    `;
    setupFormListeners();
}

function triggerDownload(url, publicName) {
    const a = document.createElement('a');
    a.href = url; 
    a.download = publicName; 
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); }, 100);
}

function setupFormListeners() {
    const t = window.t || ((k) => k);    
    const currentFileInput = document.getElementById('csv-file');
    const currentUploadForm = document.getElementById('upload-form');
    const currentUploadArea = currentUploadForm?.querySelector('.upload-area');
    if (!currentFileInput || !currentUploadForm || !currentUploadArea) return;

    const currentUploadLabel = currentUploadForm.querySelector('.upload-label');
    const currentSubmitButton = document.getElementById('upload-submit-btn'); // Corrigé pour éviter l'erreur de ciblage

    // Glisser-Déposer
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

    // Écouteur pour le changement de fichier
    currentFileInput.addEventListener('change', function() {
        if (currentFileInput.files.length > 0) {
            const originalName = currentFileInput.files[0].name;
            const truncatedName = truncateFilename(originalName, 30);
            
            if (currentSubmitButton) {
                currentSubmitButton.disabled = false;
                currentSubmitButton.textContent = t('modal.upload.btn_start_ready');
            }
            
            currentUploadLabel.innerHTML = `
                <i class="fa-solid fa-file-csv icon-purple"></i>
                <p class="text-bold">${t('modal.upload.file_ready')} 
                    <strong>${sanitize(truncatedName)}</strong>
                </p>
                <small class="text-muted">${t('modal.upload.change_file')}</small>
            `;
        } else {
            if (currentSubmitButton) {
                currentSubmitButton.disabled = true;
                currentSubmitButton.textContent = t('modal.upload.btn_start_disabled');
            }
            currentUploadLabel.innerHTML = `
                <i class="fa-solid fa-cloud-arrow-up icon-purple"></i>
                <p class="text-bold">${t('modal.upload.drag_drop_text')}</p>
                <small class="text-muted">${t('modal.upload.supported_files')}</small>
            `;   
        }
    });

    currentUploadForm.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const t = window.t || ((k) => k);
    const form = e.currentTarget;

    if (typeof gtag === 'function') {
        gtag('event', 'start_cleaning', { 'event_category': 'Engagement', 'event_label': 'CSV Upload' });
    }
    window.va('track', 'Clean_Action_Started');

    dynamicContentArea.innerHTML = `
        <div class="modal-center-view">
            <h2>${t('modal.processing.title')}</h2>
            <p class="modal-text-muted">${t('modal.processing.sending')}</p>
            <div class="processing-progress-container">
                <div class="processing-progress-bar"></div>
            </div>
            <p class="modal-text-small"><i class="fa-solid fa-clock"></i> ${t('modal.processing.wait')}</p>
        </div>
    `;
    
    const formData = new FormData(form);
    try {
        const selectedLogic = formData.get('cleaningLogic') || document.documentElement.lang || 'fr';
        const token = localStorage.getItem('mycsv_token');
        const fetchOptions = { method: 'POST', body: formData, headers: {} };
        if (token) fetchOptions.headers['X-Access-Token'] = token;
        
        const response = await fetch(`${form.action}?lang=${selectedLogic}`, fetchOptions);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 402 || data.code === 'LIMIT_REACHED' || data.code === 'FILE_TOO_LARGE_FREE') {
                displaySuccessView(data, true, data.code);
                return;
            }
            throw new Error(data.message || `Erreur Serveur: ${response.status}`);
        }
        if (data.success) {
            displaySuccessView(data, false);
        }
    } catch (error) {
        displayErrorView(error.message);
    }
}

function generatePreviewHTML(previewRows, t) {
    if (!previewRows || previewRows.length === 0) return '';
    const safeT = (key, fallback) => { const val = t ? t(key) : key; return (val && val !== key) ? val : fallback; };

    const txtOriginal = safeT('preview.original_label', 'Fichier Original');
    const txtCleaned = safeT('preview.cleaned_label', 'Fichier Nettoyé');

    let headerHTML = '';
    if (previewRows.length > 0) {
        headerHTML += '<tr>';
        previewRows[0].cleaned.forEach(col => {
            headerHTML += `<th>${sanitize(col)}</th>`;
        });
        headerHTML += '</tr>';
    }

    let leftBody = '';
    for (let i = 1; i < previewRows.length; i++) {
        leftBody += '<tr>';
        previewRows[i].original.forEach(val => {
            leftBody += `<td>${sanitize(val) || ''}</td>`;
        });
        leftBody += '</tr>';
    }

    let rightBody = '';
    for (let i = 1; i < previewRows.length; i++) {
        const rowData = previewRows[i];
        rightBody += '<tr>';
        rowData.cleaned.forEach((valClean, index) => {
            const valOrig = rowData.original[index];
            const strClean = String(valClean || '');
            const strOrig = String(valOrig || '');
            const isDiff = strClean !== strOrig;
            const cssClass = isDiff ? 'cell-diff' : '';
            
            rightBody += `<td class="${cssClass}">${sanitize(strClean)}</td>`;
        });
        rightBody += '</tr>';
    }

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
    const totalProcessed = data.originalRowsCount || 0;
    const rowsAffected = data.totalRowsAffected || 0;

    let theadHTML = '';
    let tbodyHTML = '';
    const preview = data.preview;

    // --- LOGIQUE DE TABLEAU ORIGINALE (INCHANGÉE) ---
    if (preview && preview.length > 0) {
        const MAX_COLS = 5; 
        const cleanHeaders = preview[0].cleaned;
        const origHeaders = preview[0].original;
        const origHeadersNormalized = origHeaders.map(h => (h || '').toString().trim().toLowerCase());
        const headersToShow = cleanHeaders.slice(0, MAX_COLS);
        const hasMoreCols = cleanHeaders.length > MAX_COLS;

        theadHTML = '<tr>';
        headersToShow.forEach(h => {
            theadHTML += `<th>${sanitize(h || 'Colonne')}</th>`;
        });
        if (hasMoreCols) theadHTML += '<th class="teaser-col-fade">...</th>';
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
                    tbodyHTML += `<td class="teaser-cell-fixed" title="Original: ${sanitize(origCell)}">${sanitize(cleanCell) || '-'} ✨</td>`;
                } else {
                    tbodyHTML += `<td>${sanitize(cleanCell) || '-'}</td>`;
                }
            });
            if (hasMoreCols) tbodyHTML += '<td class="teaser-col-fade">...</td>';
            tbodyHTML += '</tr>';
        });

        if (isPaywall) {
            tbodyHTML += '<tr class="teaser-row-blurred">';
            headersToShow.forEach(() => tbodyHTML += `<td>données protégées</td>`);
            if (hasMoreCols) tbodyHTML += '<td class="teaser-col-fade">...</td>';
            tbodyHTML += '</tr>';
        }
    }

    const title = isPaywall ? t('teaser.title') : t('modal.success.title');
    
    // --- CONSTRUCTION DU HTML AVEC DASHBOARD & ACCORDÉON ---
    let html = `<div class="modal-center-view success-view">`;
    html += `<h2>${title}</h2>`;

    if (isPaywall) {
        const subtitleKey = reasonCode === 'FILE_TOO_LARGE_FREE' ? t('teaser.subtitle_size') : t('teaser.subtitle_limit');
        html += `<p class="teaser-alert">${subtitleKey}</p>`;
    } else {
        html += `<p class="modal-text-muted">${t('modal.success.subtitle')}</p>`;
    }

    // --- NOUVEAU : DASHBOARD DES CORRECTIONS ---
    const rowCount = preview ? preview.length - 1 : 0;
    html += `
        <div class="dashboard-stats">
            <div class="stat-card">
                <span class="stat-value">${totalProcessed}</span>
                <span class="stat-label">Lignes traitées</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${rowsAffected}</span>
                <span class="stat-label">Lignes impactées</span>
            </div>
        </div>
    `;

    const summaryText = data.summary && data.summary.humanSummary ? data.summary.humanSummary : (data.summary || '');
    html += `
        <details>
            <summary>Voir le résumé complet</summary>
            <div class="teaser-report-container">
                ${summaryText}
            </div>
        </details>
    `;

    // --- NOUVEAU : ACCORDÉON POUR LES DÉTAILS ---
    html += `
            <div class="teaser-table-wrapper">
                <table class="teaser-table">
                    <thead>${theadHTML}</thead>
                    <tbody>${tbodyHTML}</tbody>
                </table>
    `;
    
    if (isPaywall) {
        html += `
                <div class="teaser-paywall-gradient">
                    <i class="fa-solid fa-lock"></i>
                </div>
        `;
    }
    html += `</div></details>`; // Fin Accordéon

    // --- LOGIQUE PAYWALL / DOWNLOAD (ORIGINALE) ---
    if (isPaywall) {
        html += `<p class="modal-text-muted mb-20">${t('teaser.hook')}</p>`;
        html += `
            <div class="action-buttons teaser-pricing">
                <a href="https://buy.stripe.com/28EfZj9TJ1kQ2rl9hhfAc01" class="teaser-pricing-btn btn-day">9€ - ${t('teaser.btn_day')}</a>
                <a href="https://buy.stripe.com/bJe4gBgi7gfK7LFdxxfAc02" class="teaser-pricing-btn btn-week">29€ - ${t('teaser.btn_week')}</a>
                <a href="https://buy.stripe.com/14A28t5Dte7C3vp511fAc03" class="teaser-pricing-btn btn-year">99€ - ${t('teaser.btn_year')}</a>
            </div>
        `;
    } else {
        html += `
            <div class="success-download-section">
                <div class="success-checkbox-wrapper">
                    <label class="success-checkbox-label">
                        <input type="checkbox" id="want-json"> ${t('modal.success.checkbox_json')}
                    </label>
                </div>
                <button class="cta-button success-btn-download" id="btn-download-main">
                    <i class="fa-solid fa-download"></i> <span id="btn-text">${t('modal.success.btn_download_csv')}</span>
                </button>
            </div>
        `;
    }

    html += `</div>`;
    dynamicContentArea.innerHTML = html;

    // --- ÉCOUTEURS D'ÉVÉNEMENTS (ORIGINAUX) ---
    if (!isPaywall) {
        const chkJson = document.getElementById('want-json');
        const btnDownloadMain = document.getElementById('btn-download-main');
        const btnText = document.getElementById('btn-text');
        let downloadStep = 1;

        if (chkJson && btnText) {
            chkJson.addEventListener('change', (e) => {
                if (e.target.checked) {
                    btnText.innerHTML = `${t('modal.success.btn_download_csv')} (1/2)`;
                    downloadStep = 1;
                } else {
                    btnText.innerHTML = `${t('modal.success.btn_download_csv')}`;
                }
            });
        }

        if (btnDownloadMain) {
            btnDownloadMain.addEventListener('click', (e) => {
                e.preventDefault();

                if (btnDownloadMain.disabled) return;
                if (chkJson && chkJson.checked) {
                    if (downloadStep === 1) {
                        btnDownloadMain.disabled = true;
                        btnDownloadMain.classList.add('btn-loading');
                        btnText.innerHTML = `Préparation... <i class="fa-solid fa-spinner fa-spin success-spinner"></i>`;
                        
                        triggerDownload(data.downloadUrl, data.downloadName);
                        
                        setTimeout(() => {
                            const jsonText = t('modal.success.btn_download_json') || 'Télécharger le rapport JSON';
                            btnText.innerHTML = `${jsonText} (2/2)`;
                            btnDownloadMain.disabled = false;
                            btnDownloadMain.classList.remove('btn-loading');
                            
                            downloadStep = 2;
                        }, 1500);
                        
                    } else if (downloadStep === 2) {
                        triggerDownload(data.reportDownloadUrl, data.reportDownloadName);
                        setTimeout(() => {
                            if (typeof displayPostDownloadView === 'function') {
                                displayPostDownloadView();
                            }
                        }, 500);
                    }
                } else {
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
            <p class="text-muted mb-15">${t('modal.error.prefix')} <strong>${sanitize(errorMessage)}</strong></p>
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
            <i class="fa-solid fa-circle-check final-main-icon"></i>
            <h2>${t('modal.post_download.title')}</h2>
            <p>${t('modal.post_download.desc')}</p>
            <div class="final-action-buttons">
                <button id="btn-finish-home" class="btn-secondary">
                    <i class="fa-solid fa-house"></i> ${t('modal.post_download.btn_finish')}
                </button>
                <button id="btn-new-clean" class="cta-button-again">
                    <i class="fa-solid fa-rotate-right"></i> ${t('modal.post_download.btn_again')}
                </button>
            </div>
            <div class="modal-text-small">
                ${t('modal.post_download.security_delete')}
            </div>
        </div>
    `;

    const finishBtn = document.getElementById('btn-finish-home');
    if (finishBtn) finishBtn.addEventListener('click', closeModal);

    const restartBtn = document.getElementById('btn-new-clean');
    if (restartBtn) restartBtn.addEventListener('click', resetModal);
}

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

document.addEventListener('DOMContentLoaded', () => {
    const localeToggle = document.getElementById('locale-toggle');
    const tableFr = document.getElementById('table-fr');
    const tableUs = document.getElementById('table-us');

    if (localeToggle && tableFr && tableUs) {
        localeToggle.addEventListener('change', () => {
            if (localeToggle.checked) {
                // Mode US activé
                tableFr.classList.replace('active-view', 'hidden-view');
                tableUs.classList.replace('hidden-view', 'active-view');
            } else {
                // Mode FR activé
                tableUs.classList.replace('active-view', 'hidden-view');
                tableFr.classList.replace('hidden-view', 'active-view');
            }
        });
    }
});