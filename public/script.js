
const modalElement = document.getElementById('upload-modal');
const dynamicContentArea = document.getElementById('dynamic-content');

// --- GESTION DU GLISSER-DÉPOSER GLOBAL (ANTI-NAVIGATION) ---
function setupDragDropProtection() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
}

// --- FONCTION UTILITAIRE DE TRONCATURE AU MILIEU (MISE À JOUR) ---
/**
 * Tronque le nom du fichier au milieu pour garder le début, une partie de la fin, et l'extension visibles.
 * @param {string} filename Le nom complet du fichier 
 * @param {number} maxLength La longueur maximale souhaitée (30 par défaut)
 * @returns {string} Le nom tronqué (ex: 'nom_tro...fin.csv')
 */
function truncateFilename(filename, maxLength = 30) {
    if (filename.length <= maxLength) {
        return filename;
    }
    
    const MIN_END_CHARS = 5; // Nombre de caractères minimum à conserver à la fin du nom (avant l'extension)
    const ellipsis = '...';
    const extensionMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
    const extension = extensionMatch ? extensionMatch[0] : ''; // Ex: .csv
    const nameWithoutExt = extensionMatch ? filename.substring(0, filename.length - extension.length) : filename;
    const nameLength = nameWithoutExt.length;
    const availableNameLength = maxLength - extension.length - ellipsis.length;
    const endPartLength = Math.min(MIN_END_CHARS, nameLength - 1); // Toujours laisser au moins 1 caractère au début
    const startPartLength = Math.max(1, availableNameLength - endPartLength); // Toujours garder au moins 1 caractère au début
    const startPart = nameWithoutExt.substring(0, startPartLength);
    const endPart = nameWithoutExt.substring(nameLength - endPartLength);

    return startPart + ellipsis + endPart + extension;
}

// --- GESTION DU CHARGEMENT DE LA PAGE (CORRECTIF BUG DE DÉFILEMENT) ---

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. GESTION DES CLICS (Remplacement des onclick HTML)
    // On sélectionne tous les boutons qui doivent ouvrir la modale
    const openButtons = document.querySelectorAll('.js-open-modal');
    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Empêche le comportement par défaut
            openModal();
        });
    });

    // On gère le bouton de fermeture (la croix)
    const closeBtn = document.querySelector('.js-close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    }

    // 2. LE RESTE DE TON CODE EXISTANT
    // Force le défilement en haut après le chargement du DOM
    setTimeout(function() {
        if (window.location.hash === "") {
            window.scrollTo({
                top: 0,
                behavior: 'auto'
            });
        }
    }, 0); 

    // --- NOUVEL APPEL ---
    setupDragDropProtection();
});

window.onload = function() {
    resetModal(); 
}

// --- Fonctions de défilement (Scroll) ---
function scrollToSection(event, sectionId) {
    event.preventDefault();
    
    const targetElement = document.getElementById(sectionId);
    
    if (targetElement) {
        const headerHeight = 80; 
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
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

function resetModal() {
    dynamicContentArea.innerHTML = `
        <h2>Nettoyez votre fichier en quelques secondes :</h2>
        <div class="upload-step">
            <h3>1. Téléversez votre CSV</h3>
            <form id="upload-form" class="upload-area-wrapper" method="POST" action="https://cleanmycsv-backend-536004118248.europe-west1.run.app/clean-file" enctype="multipart/form-data">                
                <input type="file" id="csv-file" name="csv_file_to_clean" accept=".csv" required 
                    class="visually-hidden">
                
                <div class="upload-area">
                    <label for="csv-file" class="upload-label">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <p>Cliquez ou glissez-déposez votre fichier ici</p>
                        <small>Fichiers supportés : .CSV uniquement</small>
                    </label>
                </div>
                <button type="submit" class="cta-button start-clean-btn" disabled>
                    Lancer le Nettoyage (Gratuit)
                </button>
            </form>
        </div>
        <p class="security-note">
            <i class="fa-solid fa-lock"></i> Vos données sont sécurisées et traitées de manière anonyme.
        </p>
    `;
    
    setupFormListeners();
}

// --- Fonctions de téléchargement (MODIFIÉE POUR CLOUD STORAGE) ---
function triggerDownload(url, publicName) {
    console.log('Téléchargement lancé pour :', publicName);
    
    // On crée un lien invisible qui pointe vers l'URL signée de Google
    const a = document.createElement('a');
    a.href = url; 
    
    // Note : L'attribut 'download' fonctionne mal en cross-origin (Google vs ton site),
    // mais ce n'est pas grave car le Backend a forcé le nom via 'promptSaveAs'.
    a.download = publicName; 
    // a.target = "_blank"; // Sécurité pour éviter de fermer la modale
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
         document.body.removeChild(a);
    }, 100);
}

// --- Gestion des Événements du Formulaire d'Upload ---
/**
 * Configure les écouteurs d'événements pour le formulaire d'upload (qui est dynamique).
 */
function setupFormListeners() {
    console.log('--- Démarrage de setupFormListeners() ---');
    
    // Récupération des éléments du formulaire
    const currentFileInput = document.getElementById('csv-file');
    const currentUploadForm = document.getElementById('upload-form');
    const currentUploadArea = currentUploadForm.querySelector('.upload-area');

    // Vérification de la présence des éléments de base
    if (!currentFileInput || !currentUploadForm || !currentUploadArea) {
        console.error('Erreur: Le fichier input (csv-file) ou le formulaire (upload-form) est introuvable.');
        return;
    }
    console.log('Éléments de formulaire de base trouvés.');

    const currentUploadLabel = currentUploadForm.querySelector('.upload-label');
    const currentSubmitButton = currentUploadForm.querySelector('.start-clean-btn'); 
    
    if (!currentSubmitButton) {
        console.error('Erreur: Le bouton de soumission (.start-clean-btn) est introuvable.');
        return;
    }
    console.log('Bouton de soumission trouvé. État initial: DISABLED.');

    // 1. Logique du Glisser-Déposer
    
    ['dragenter', 'dragover'].forEach(eventName => {
        currentUploadArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentUploadArea.classList.add('highlight'); // Ajouter une classe pour le style
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        currentUploadArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentUploadArea.classList.remove('highlight'); // Retirer la classe
        }, false);
    });

    currentUploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
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
            console.log('Fichier CSV déposé:', file.name);

            if (!file.name.toLowerCase().endsWith('.csv')) {
                 alert('Format de fichier non supporté. Seuls les fichiers .CSV sont acceptés.');
                 return;
            }
            
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            currentFileInput.files = dataTransfer.files;
            
            const changeEvent = new Event('change');
            currentFileInput.dispatchEvent(changeEvent);

        } else {
             alert("Seuls les fichiers CSV sont supportés ou le fichier n'a pas pu être lu.");
        }
    }

    // 2. Écouteur pour le changement de fichier (activation du bouton)
    currentFileInput.addEventListener('change', function() {
        console.log('Événement CHANGE détecté sur l\'input fichier.');

        if (currentFileInput.files.length > 0) {
            console.log('Fichier sélectionné. Tentative d\'activation du bouton...');
            
            const originalName = currentFileInput.files[0].name;
            const truncatedName = truncateFilename(originalName, 30);
            
            currentSubmitButton.disabled = false; // <<< LIGNE CRITIQUE : ACTIVE LE BOUTON
            currentSubmitButton.textContent = `Lancer le nettoyage de votre fichier`;
            
            console.log('Bouton activé et texte mis à jour.');

            currentUploadLabel.innerHTML = `
                <i class="fa-solid fa-file-csv icon-purple"></i>
                <p class="text-bold">Fichier prêt : 
                    <strong>${truncatedName}</strong>
                </p>
                <small class="text-muted">Cliquez pour changer de fichier</small>
            `;
        } else {
            console.log('Aucun fichier sélectionné. Bouton désactivé.');
            currentSubmitButton.disabled = true;
            currentSubmitButton.textContent = 'Lancer le Nettoyage (Gratuit)';
            currentUploadLabel.innerHTML = `
                <i class="fa-solid fa-cloud-arrow-up icon-purple"></i>
                <p class="text-bold">Cliquez ou glissez-déposez votre fichier ici</p>
                <small class="text-muted">Fichiers supportés : .CSV uniquement</small>
            `;   
        }
    });

    // 3. Écouteur pour la soumission du formulaire
    currentUploadForm.addEventListener('submit', handleFormSubmit);
    console.log('--- setupFormListeners() terminé ---');
}

// --- Logique de Soumission (AJAX) ---
async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    
    dynamicContentArea.innerHTML = `
        <div class="modal-center-view">
            <h2>Nettoyage en cours...</h2>
            <p class="text-muted">Envoi du fichier à votre script de nettoyage...</p>
            <div class="spinner-custom"></div> 
            <p class="text-muted-small"><i class="fa-solid fa-clock"></i> Cela prendra juste un instant !</p>
        </div>
    `;
    
    const formData = new FormData(form);
    
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
        });
        
        const data = await response.json();

        if (response.ok && data.success) {
            displaySuccessView(data);
        } else {
            throw new Error(data.message || `Erreur Serveur: ${response.status} ${response.statusText}`);
        }

    } catch (error) {
        console.error('Erreur Critique:', error);
        displayErrorView(error.message);
    }
}

// --- Vues de la Modale (Succès / Erreur) ---
function displaySuccessView(data) {
const summary = data.summary;
    
    // --- MODIF ICI : On récupère les URLs complètes ---
    const csvDownloadUrl = data.downloadUrl;       // L'URL signée Google pour le CSV
    const csvDownloadName = data.downloadName;     // Le joli nom "mon-fichier-clean.csv"
    
    const jsonDownloadUrl = data.reportDownloadUrl; // L'URL signée Google pour le JSON
    const jsonDownloadName = data.reportDownloadName; // Le joli nom "mon-fichier-report.json"
    
    dynamicContentArea.innerHTML = `
        <div class="modal-header-center">
            <i class="fa-solid fa-circle-check icon-success-lg"></i>
            <h2 class="modal-title">Votre fichier est prêt !</h2>
        </div>
        <div class="modal-section">
            <h3 class="modal-subtitle">Rapport de Nettoyage</h3>

            <div class="metric-container">
                <div class="metric-item">
                    <p class="metric-value" id="metric-affected">${summary.totalRowsAffected}</p>
                    <p class="metric-label">Lignes affectées</p>
                </div>
                <div class="metric-item">
                    <p class="metric-value" id="metric-removed">${summary.rowsRemoved}</p>
                    <p class="metric-label">Lignes / Doublons retirés</p>
                </div>
            </div>
            
            <div class="result-summary-box">
                <div id="humanSummary">${summary.humanSummary}</div>
            </div>
            
        </div>
        <label for="includeJson" class="checkbox-wrapper">
            <input type="checkbox" id="includeJson">
            <label for="includeJson" class="text-medium">Je veux aussi le <strong>rapport détaillé JSON</strong> des corrections (pour les experts).</label>
        </label>
        <div class="mt-20 pt-10">
            <button id="downloadAllBtn" class="cta-button download-btn-success w-100">
                <i class="fa-solid fa-download"></i> 
                Télécharger le CSV Nettoyé
            </button>
        </div>
    `;
    
    const downloadBtn = document.getElementById('downloadAllBtn');
    const jsonCheckbox = document.getElementById('includeJson');
    let jsonAttempted = false;

    jsonCheckbox.addEventListener('change', () => {
        jsonAttempted = false;
        if (jsonCheckbox.checked) {
            downloadBtn.innerHTML = `
            <i class=\"fa-solid fa-download\"></i> 
            Télécharger le CSV Nettoyé (1/2)
            `;
            downloadBtn.classList.remove('download-btn-json');
            downloadBtn.classList.add('download-btn-success');
        } else {
            downloadBtn.innerHTML = `
            <i class=\"fa-solid fa-download\"></i> 
            Télécharger le CSV Nettoyé
            `;
            downloadBtn.classList.remove('download-btn-json');
            downloadBtn.classList.add('download-btn-success');
        }
    });

    downloadBtn.addEventListener('click', () => {
        const includeJson = jsonCheckbox.checked;
        
        if (!includeJson) {
            triggerDownload(csvDownloadUrl, csvDownloadName);
            setTimeout(() => {
                displayPostDownloadView();
            }, 300);
        } else if (includeJson && !jsonAttempted) {
            triggerDownload(csvDownloadUrl, csvDownloadName);
            downloadBtn.innerHTML = `
                <i class="fa-solid fa-download"></i> 
                Télécharger le Rapport JSON (2/2) 
            `;
            downloadBtn.classList.remove('download-btn-success');
            downloadBtn.classList.add('download-btn-json');
            jsonAttempted = true;
        } else if (includeJson && jsonAttempted) {
            triggerDownload(jsonDownloadUrl, jsonDownloadName);
            setTimeout(() => {
                displayPostDownloadView();
            }, 1500);
        }
    });
}

function displayErrorView(errorMessage) {
     // 1. On injecte le HTML (sans onclick, mais avec un ID)
     dynamicContentArea.innerHTML = `
        <div class="modal-center-view">
            <i class="fa-solid fa-triangle-exclamation icon-danger-lg"></i>
            <h2 class="modal-title">Oups, Erreur !</h2>
            <p class="text-muted mb-15">Désolé, une erreur est survenue : <strong>${errorMessage}</strong></p>
            <button id="btn-error-retry" class="cta-button btn-secondary">
                Fermer et réessayer
            </button>
        </div>`;
    
    // 2. On attache l'événement JS sur le bouton qu'on vient de créer
    const retryBtn = document.getElementById('btn-error-retry');
    if (retryBtn) {
        retryBtn.addEventListener('click', closeModal);
    }
}

function displayPostDownloadView() {
    // 1. Injection HTML (Classes CSS + IDs, pas de styles/scripts inline)
    dynamicContentArea.innerHTML = `
        <div class="final-success-view">
            <i class="fa-solid fa-circle-check main-icon"></i>
            
            <h2>Mission Accomplie !</h2>
            <p>
                Votre fichier nettoyé est maintenant disponible dans vos téléchargements.
            </p>
            
            <div class="action-buttons">
                <button id="btn-finish-home" class="btn-secondary">
                    <i class="fa-solid fa-house"></i> Terminer et retourner au site
                </button>

                <button id="btn-new-clean" class="cta-button-again">
                    <i class="fa-solid fa-rotate-right"></i> Nettoyer un autre fichier
                </button>
            </div>
            
            <div class="text-muted-small mt-20">
                Vos données originales ont été effacées de nos serveurs par sécurité.
            </div>
        </div>
    `;

    // 2. Attachement des événements
    
    // Bouton "Terminer" -> Ferme la modale
    const finishBtn = document.getElementById('btn-finish-home');
    if (finishBtn) {
        finishBtn.addEventListener('click', closeModal);
    }

    // Bouton "Nettoyer un autre" -> Relance le formulaire (resetModal)
    const restartBtn = document.getElementById('btn-new-clean');
    if (restartBtn) {
        restartBtn.addEventListener('click', resetModal);
    }
}


// --- GESTION DU HEADER LORS DU DÉFILEMENT (OPTIMISÉE) ---
function setupHeaderScroll() {
    const header = document.querySelector('.main-header');
    let ticking = false; // Variable pour éviter de surcharger le navigateur

    if (header) {
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // Cette logique ne s'exécutera que quand le navigateur est prêt
                    if (window.scrollY > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
}

// Appelez la fonction pour initialiser l'écouteur d'événement
setupHeaderScroll();