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

// --- FONCTION PRINCIPALE : RESET MODAL (TRADUIT) ---
function resetModal() {
    // Utilisation de window.t() défini dans i18n-loader.js
    // Si window.t n'est pas encore prêt, on utilise une fonction fallback
    const t = window.t || ((k) => k);

    dynamicContentArea.innerHTML = `
        <h2>${t('modal.upload.main_title')}</h2>
        <div class="upload-step">
            <h3>${t('modal.upload.step_1')}</h3>
            <form id="upload-form" class="upload-area-wrapper" method="POST" action="https://cleanmycsv-backend-536004118248.europe-west1.run.app/clean-file" enctype="multipart/form-data">                
                <input type="file" id="csv-file" name="csv_file_to_clean" accept=".csv" required 
                    class="visually-hidden">
                
                <div class="upload-area">
                    <label for="csv-file" class="upload-label">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <p>${t('modal.upload.drag_drop_text')}</p>
                        <small>${t('modal.upload.supported_files')}</small>
                    </label>
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
    
    dynamicContentArea.innerHTML = `
        <div class="modal-center-view">
            <h2>${t('modal.processing.title')}</h2>
            <p class="text-muted">${t('modal.processing.sending')}</p>
            <div class="spinner-custom"></div> 
            <p class="text-muted-small"><i class="fa-solid fa-clock"></i> ${t('modal.processing.wait')}</p>
        </div>
    `;
    
    const formData = new FormData(form);
    
    try {
        // 1. Récupère la langue actuelle (celle de la balise HTML)
        const currentLang = document.documentElement.lang || 'en'; 

        // 2. Ajoute-la dans l'URL d'envoi
        const response = await fetch(`${form.action}?lang=${currentLang}`, { 
            method: 'POST', 
            body: formData 
        });

        const data = await response.json();

        if (response.ok && data.success) {
            displaySuccessView(data);
        } else {
            throw new Error(data.message || `Erreur Serveur: ${response.status}`);
        }
    } catch (error) {
        console.error('Erreur Critique:', error);
        displayErrorView(error.message);
    }
}

// --- Vues de la Modale (Succès) ---
function displaySuccessView(data) {
    const t = window.t || ((k) => k);
    const summary = data.summary;
    const csvDownloadUrl = data.downloadUrl;
    const csvDownloadName = data.downloadName;
    const jsonDownloadUrl = data.reportDownloadUrl;
    const jsonDownloadName = data.reportDownloadName;
    
    // Note: summary.humanSummary vient du backend, il sera peut-être en français si le backend n'est pas traduit.
    // L'idéal est que le backend renvoie des codes d'erreur ou des chiffres, mais pour l'instant on garde tel quel.

    dynamicContentArea.innerHTML = `
        <div class="modal-header-center">
            <i class="fa-solid fa-circle-check icon-success-lg"></i>
            <h2 class="modal-title">${t('modal.success.title')}</h2>
        </div>
        <div class="modal-section">
            <h3 class="modal-subtitle">${t('modal.success.subtitle')}</h3>

            <div class="metric-container">
                <div class="metric-item">
                    <p class="metric-value" id="metric-affected">${summary.totalRowsAffected}</p>
                    <p class="metric-label">${t('modal.success.rows_affected')}</p>
                </div>
                <div class="metric-item">
                    <p class="metric-value" id="metric-removed">${summary.rowsRemoved}</p>
                    <p class="metric-label">${t('modal.success.rows_removed')}</p>
                </div>
            </div>
            
            <div class="result-summary-box">
                <div id="humanSummary">${summary.humanSummary}</div>
            </div>
            
        </div>
        <label for="includeJson" class="checkbox-wrapper">
            <input type="checkbox" id="includeJson">
            <label for="includeJson" class="text-medium">${t('modal.success.checkbox_json')}</label>
        </label>
        <div class="mt-20 pt-10">
            <button id="downloadAllBtn" class="cta-button download-btn-success w-100">
                <i class="fa-solid fa-download"></i> 
                ${t('modal.success.btn_download_csv')}
            </button>
        </div>
    `;
    
    const downloadBtn = document.getElementById('downloadAllBtn');
    const jsonCheckbox = document.getElementById('includeJson');
    let jsonAttempted = false;

    jsonCheckbox.addEventListener('change', () => {
        jsonAttempted = false;
        // Mise à jour dynamique du bouton selon l'état de la case
        if (jsonCheckbox.checked) {
            downloadBtn.innerHTML = `<i class=\"fa-solid fa-download\"></i> ${t('modal.success.btn_download_csv')} (1/2)`;
            downloadBtn.classList.remove('download-btn-json');
            downloadBtn.classList.add('download-btn-success');
        } else {
            downloadBtn.innerHTML = `<i class=\"fa-solid fa-download\"></i> ${t('modal.success.btn_download_csv')}`;
            downloadBtn.classList.remove('download-btn-json');
            downloadBtn.classList.add('download-btn-success');
        }
    });

    downloadBtn.addEventListener('click', () => {
        const includeJson = jsonCheckbox.checked;
        
        if (typeof gtag === 'function') {
            gtag('event', 'download_file', {
                'event_category': 'Conversion',
                'event_label': includeJson ? 'CSV + JSON' : 'CSV Only',
                'file_type': 'csv'
            });
        }

        if (!includeJson) {
            triggerDownload(csvDownloadUrl, csvDownloadName);
            setTimeout(() => { displayPostDownloadView(); }, 300);
        } else if (includeJson && !jsonAttempted) {
            triggerDownload(csvDownloadUrl, csvDownloadName);
            downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> ${t('modal.success.btn_download_json')} (2/2)`;
            downloadBtn.classList.remove('download-btn-success');
            downloadBtn.classList.add('download-btn-json');
            jsonAttempted = true;
        } else if (includeJson && jsonAttempted) {
            triggerDownload(jsonDownloadUrl, jsonDownloadName);
            setTimeout(() => { displayPostDownloadView(); }, 1500);
        }
    });
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