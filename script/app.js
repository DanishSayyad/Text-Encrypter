// Application logic for encryption/decryption
document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const operationTitle = document.getElementById('operationTitle');
    const operationInput = document.getElementById('operationInput');
    const operationBtn = document.getElementById('operationBtn');
    const operationOutput = document.getElementById('operationOutput');
    const encryptionKey = document.getElementById('encryptionKey');
    const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
    const keyInputGroup = document.getElementById('keyInputGroup');
    const wipeAllBtn = document.getElementById('wipeAllBtn');
    const textsView = document.getElementById('textsView');
    const storedTextsContainer = document.getElementById('storedTextsContainer');
    const textViewer = document.getElementById('textViewer');
    const closeViewer = document.getElementById('closeViewer');
    const viewedText = document.getElementById('viewedText');
    const copyViewerText = document.getElementById('copyViewerText');

    let currentMode = 'encrypt';
    const STORAGE_KEY = 'encrypted_texts';

    // Load stored texts
    function getStoredTexts() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    // Save texts to storage
    function saveStoredTexts(texts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(texts));
    }

    // Render stored texts
    function renderStoredTexts() {
        const texts = getStoredTexts();
        
        if (texts.length === 0) {
            storedTextsContainer.innerHTML = '<p class="no-texts-message">No encrypted texts stored yet</p>';
        } else {
            storedTextsContainer.innerHTML = texts.map((text, index) => `
                <div class="text-card" data-index="${index}">
                    <div class="text-card-preview" onclick="viewText(${index})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <span class="text-preview">${text.substring(0, 50)}${text.length > 50 ? '...' : ''}</span>
                    </div>
                    <button class="btn-delete" onclick="deleteText(${index})" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `).join('');
        }
    }

    // View text in viewer
    window.viewText = function(index) {
        const texts = getStoredTexts();
        if (texts[index]) {
            viewedText.textContent = texts[index];
            storedTextsContainer.style.display = 'none';
            textViewer.style.display = 'block';
        }
    };

    // Delete text
    window.deleteText = function(index) {
        if (confirm('Are you sure you want to delete this text?')) {
            const texts = getStoredTexts();
            texts.splice(index, 1);
            saveStoredTexts(texts);
            renderStoredTexts();
        }
    };

    // Close viewer
    if (closeViewer) {
        closeViewer.addEventListener('click', () => {
            textViewer.style.display = 'none';
            storedTextsContainer.style.display = 'block';
        });
    }

    // Copy from viewer
    if (copyViewerText) {
        copyViewerText.addEventListener('click', () => {
            const text = viewedText.textContent;
            navigator.clipboard.writeText(text).then(() => {
                copyViewerText.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Copied!
                `;
                copyViewerText.style.background = '#00ff88';
                copyViewerText.style.color = '#0a1f1a';
                
                setTimeout(() => {
                    copyViewerText.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                    `;
                    copyViewerText.style.background = '';
                    copyViewerText.style.color = '';
                }, 2000);
            });
        });
    }

    // Wipe all texts
    if (wipeAllBtn) {
        wipeAllBtn.addEventListener('click', () => {
            if (confirm('⚠️ WARNING: This will permanently delete ALL stored encrypted texts. This action cannot be undone. Are you sure?')) {
                localStorage.removeItem(STORAGE_KEY);
                renderStoredTexts();
            }
        });
    }

    // Toggle between encrypt, decrypt, and texts modes
    if (toggleBtns.length > 0) {
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                toggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Get mode
                currentMode = btn.dataset.mode;

                // Update UI based on mode
                if (currentMode === 'encrypt') {
                    operationTitle.textContent = 'Encrypt Text';
                    operationInput.placeholder = 'Enter text to encrypt...';
                    operationInput.style.display = 'block';
                    keyInputGroup.style.display = 'block';
                    operationBtn.style.display = 'flex';
                    operationOutput.style.display = 'block';
                    textsView.style.display = 'none';
                    wipeAllBtn.style.display = 'none';
                    operationBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Encrypt
                    `;
                } else if (currentMode === 'decrypt') {
                    operationTitle.textContent = 'Decrypt Text';
                    operationInput.placeholder = 'Enter text to decrypt...';
                    operationInput.style.display = 'block';
                    keyInputGroup.style.display = 'block';
                    operationBtn.style.display = 'flex';
                    operationOutput.style.display = 'block';
                    textsView.style.display = 'none';
                    wipeAllBtn.style.display = 'none';
                    operationBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                        </svg>
                        Decrypt
                    `;
                } else if (currentMode === 'texts') {
                    operationTitle.textContent = 'Stored Encrypted Texts';
                    operationInput.style.display = 'none';
                    keyInputGroup.style.display = 'none';
                    operationBtn.style.display = 'none';
                    operationOutput.style.display = 'none';
                    textsView.style.display = 'block';
                    wipeAllBtn.style.display = 'flex';
                    renderStoredTexts();
                }

                // Clear inputs and outputs
                operationInput.value = '';
                operationOutput.innerHTML = '';
                encryptionKey.value = '';
            });
        });
    }

    // Toggle key visibility
    if (toggleKeyVisibility) {
        toggleKeyVisibility.addEventListener('click', () => {
            const type = encryptionKey.type === 'password' ? 'text' : 'password';
            encryptionKey.type = type;
            
            // Update icon
            if (type === 'text') {
                toggleKeyVisibility.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                `;
            } else {
                toggleKeyVisibility.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                `;
            }
        });
    }

    // AES-like encryption using key (using XOR for simplicity - can be enhanced)
    function encryptWithKey(text, key) {
        if (!key || key.length === 0) return null;
        
        try {
            let result = '';
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode);
            }
            return btoa(result);
        } catch (e) {
            return null;
        }
    }

    // Decryption using key
    function decryptWithKey(encryptedText, key) {
        if (!key || key.length === 0) return null;
        
        try {
            const text = atob(encryptedText);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode);
            }
            return result;
        } catch (e) {
            return null;
        }
    }

    // Operation button handler
    if (operationBtn) {
        operationBtn.addEventListener('click', () => {
            const text = operationInput.value.trim();
            const key = encryptionKey.value.trim();

            // Validate inputs
            if (!text) {
                operationOutput.innerHTML = `<span class="error">Please enter text to ${currentMode}</span>`;
                return;
            }

            if (!key) {
                operationOutput.innerHTML = '<span class="error">Please enter an encryption key</span>';
                return;
            }

            if (key.length < 4) {
                operationOutput.innerHTML = '<span class="error">Key must be at least 4 characters long</span>';
                return;
            }

            let result;
            let label;

            if (currentMode === 'encrypt') {
                result = encryptWithKey(text, key);
                label = 'Encrypted';
            } else {
                result = decryptWithKey(text, key);
                label = 'Decrypted';
            }

            if (result) {
                const resultHTML = `
                    <div class="success">
                        <strong>${label}:</strong><br>
                        <code>${escapeHtml(result)}</code>
                        <button class="btn-copy" onclick="copyToClipboard(\`${escapeHtml(result)}\`)">Copy</button>
                        ${currentMode === 'encrypt' ? '<button class="btn-save" onclick="saveEncryptedText(\`' + escapeHtml(result) + '\`)">Save to Texts</button>' : ''}
                    </div>
                `;
                operationOutput.innerHTML = resultHTML;
            } else {
                const errorMsg = currentMode === 'encrypt' 
                    ? 'Encryption failed' 
                    : 'Decryption failed - invalid encrypted text or wrong key';
                operationOutput.innerHTML = `<span class="error">${errorMsg}</span>`;
            }
        });
    }
});

// Save encrypted text to storage
window.saveEncryptedText = function(text) {
    const STORAGE_KEY = 'encrypted_texts';
    const texts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    texts.push(text);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(texts));
    
    // Show confirmation
    const saveBtn = event.target;
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved!';
    saveBtn.style.background = '#00ff88';
    saveBtn.style.color = '#0a1f1a';
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
        saveBtn.style.color = '';
    }, 2000);
};

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary success message
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#00ff88';
        btn.style.color = '#0a1f1a';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    });
}
