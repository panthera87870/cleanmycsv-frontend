// ==============================================
// PUBLIC/SCRIPT.JS (Correction Finale Safari & Débogage)
// Le style de l'input de fichier est corrigé pour être compatible avec Safari.
// ==============================================

// --- Constantes et Éléments DOM ---
const modalElement = document.getElementById('upload-modal');
const dynamicContentArea = document.getElementById('dynamic-content');

// --- GESTION DU CHARGEMENT DE LA PAGE (CORRECTIF BUG DE DÉFILEMENT) ---

document.addEventListener('DOMContentLoaded', function() {
    // Force le défilement en haut après le chargement du DOM
    setTimeout(function() {
        if (window.location.hash === "") {
            window.scrollTo({
                top: 0,
                behavior: 'auto'
            });
        }
    }, 0); 
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

function closeModal(event) {
    if (!event || event.target === modalElement || (event.type === 'click' && event.currentTarget.classList.contains('close-btn'))) {
        modalElement.classList.remove('visible');
        setTimeout(resetModal, 300);
    }
}

function resetModal() {
    // Injecte le HTML de l'étape d'upload
    dynamicContentArea.innerHTML = `
        <h2>Nettoyer votre fichier en quelque secondes :</h2>
        <div class="upload-step">
            <h3>1. Téléversez votre CSV</h3>
            <form id="upload-form" class="upload-area-wrapper" method="POST" action="/clean-file" enctype="multipart/form-data">
                
                <input type="file" id="csv-file" name="csv_file_to_clean" accept=".csv" required 
                    style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">
                
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
    
    // Re-lier les événements après l'injection du nouveau HTML
    setupFormListeners();
}


// --- Fonctions de téléchargement ---
function triggerDownload(tempName, publicName) {
    console.log('Tentative de téléchargement:', publicName, 'à partir de:', tempName);
    const url = `/download/${tempName}?publicName=${encodeURIComponent(publicName)}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = publicName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
         document.body.removeChild(a);
         console.log('Lien de téléchargement temporaire supprimé.');
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
    
    // Vérification de la présence des éléments de base
    if (!currentFileInput || !currentUploadForm) {
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


    // 1. Écouteur pour le changement de fichier (activation du bouton)
    currentFileInput.addEventListener('change', function() {
        console.log('Événement CHANGE détecté sur l\'input fichier.');

        if (currentFileInput.files.length > 0) {
            console.log('Fichier sélectionné. Tentative d\'activation du bouton...');
            
            currentSubmitButton.disabled = false; // <<< LIGNE CRITIQUE : ACTIVE LE BOUTON
            currentSubmitButton.textContent = `Nettoyer : ${currentFileInput.files[0].name}`;
            
            console.log('Bouton activé et texte mis à jour.');

            // Mise à jour visuelle du label
            currentUploadLabel.innerHTML = `<i class="fa-solid fa-file-csv" style="color: var(--secondary-purple);"></i><p style="font-weight: 600;">Fichier prêt : <strong>${currentFileInput.files[0].name}</strong></p><small style="color: var(--subtext-color);">Cliquez pour changer de fichier</small>`;
        } else {
            console.log('Aucun fichier sélectionné. Bouton désactivé.');
            currentSubmitButton.disabled = true;
            currentSubmitButton.textContent = 'Lancer le Nettoyage (Gratuit)';
            currentUploadLabel.innerHTML = `<i class="fa-solid fa-cloud-arrow-up" style="color: var(--secondary-purple);"></i><p style="font-weight: 600;">Cliquez ou glissez-déposez votre fichier ici</p><small style="color: var(--subtext-color);">Fichiers supportés : .CSV uniquement</small>`;
        }
    });

    // 2. Écouteur pour la soumission du formulaire
    currentUploadForm.addEventListener('submit', handleFormSubmit);
    console.log('--- setupFormListeners() terminé ---');
}

// --- Logique de Soumission (AJAX) ---
async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    
    dynamicContentArea.innerHTML = `
        <div style="text-align: center; padding: 50px 20px;">
            <h2>Nettoyage en cours...</h2>
            <p style="color: var(--subtext-color);">Envoi du fichier à votre script de nettoyage...</p>
            <div class="spinner-custom"></div> 
            <p style="margin-top: 20px; color: var(--subtext-color); font-size: 0.9rem;"><i class="fa-solid fa-clock"></i> Cela prendra juste un instant !</p>
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
    const csvTempName = data.csvTempName;
    const reportTempName = data.reportTempName;
    const csvDownloadName = data.downloadName;
    const jsonDownloadName = data.reportDownloadName;

    dynamicContentArea.innerHTML = `
        <div style="text-align: center; padding: 0 0 15px 0; border-bottom: 1px solid var(--color-border);">
            <i class="fa-solid fa-circle-check" style="color: var(--color-success); font-size: 3rem;"></i>
            <h2 style="margin-top: 10px; font-weight: 800; font-size: 1.8rem;">Votre fichier est prêt ! 🥳</h2>
        </div>
        <div style="padding: 15px 0;">
            <h3 style="font-weight: 700; color: var(--secondary-purple); margin-bottom: 10px; font-size: 1.25rem;">Rapport de Nettoyage</h3>
            <div class="result-summary-box">
                <div id="humanSummary">${summary.humanSummary}</div>
            </div>
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
            <p style="text-align: center; font-size: 0.8em; color: var(--subtext-color); margin-top: 10px;">
                Fichier original : ${summary.originalRowsCount} lignes &rarr; ${summary.cleanedRowsCount} lignes nettoyées.
            </p>
        </div>
        <label for="includeJson" class="checkbox-wrapper">
            <input type="checkbox" id="includeJson">
            <label for="includeJson" style="font-weight: 500;">Je veux aussi le <strong>rapport détaillé JSON</strong> des corrections (pour les experts).</label>
        </label>
        <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid var(--color-border);">
            <button id="downloadAllBtn" class="cta-button download-btn-success" style="width: 100%;">
                <i class="fa-solid fa-download"></i> Télécharger le CSV Nettoyé (${csvDownloadName})
            </button>
        </div>
    `;
    
    const downloadBtn = document.getElementById('downloadAllBtn');
    const jsonCheckbox = document.getElementById('includeJson');
    let jsonAttempted = false;

    jsonCheckbox.addEventListener('change', () => {
        jsonAttempted = false;
        if (jsonCheckbox.checked) {
            downloadBtn.textContent = `Télécharger le CSV Nettoyé (1/2)`;
            downloadBtn.classList.remove('download-btn-json');
            downloadBtn.classList.add('download-btn-success');
        } else {
            downloadBtn.textContent = `Télécharger le CSV Nettoyé (${csvDownloadName})`;
            downloadBtn.classList.remove('download-btn-json');
            downloadBtn.classList.add('download-btn-success');
        }
    });

    downloadBtn.addEventListener('click', () => {
        const includeJson = jsonCheckbox.checked;
        
        if (!includeJson) {
            triggerDownload(csvTempName, csvDownloadName);
            setTimeout(closeModal, 100);
        } else if (includeJson && !jsonAttempted) {
            triggerDownload(csvTempName, csvDownloadName);
            downloadBtn.textContent = `Télécharger le Rapport JSON (2/2) (${jsonDownloadName})`;
            downloadBtn.classList.remove('download-btn-success');
            downloadBtn.classList.add('download-btn-json');
            jsonAttempted = true;
        } else if (includeJson && jsonAttempted) {
            triggerDownload(reportTempName, jsonDownloadName);
            setTimeout(closeModal, 100);
        }
    });
}

function displayErrorView(errorMessage) {
     dynamicContentArea.innerHTML = `
        <div style="text-align: center; padding: 50px 20px;">
            <i class="fa-solid fa-triangle-exclamation" style="color: var(--color-danger); font-size: 3rem;"></i>
            <h2 style="font-weight: 800; font-size: 1.8rem; margin-top: 10px;">Oups, Erreur !</h2>
            <p style="color: var(--subtext-color); margin-bottom: 15px;">Désolé, une erreur est survenue : <strong>${errorMessage}</strong></p>
            <button class="cta-button" style="background-color: var(--secondary-purple); color: var(--white); padding: 10px 20px; border-radius: 8px;" onclick="closeModal()">
                Fermer et réessayer
            </button>
        </div>`;
}