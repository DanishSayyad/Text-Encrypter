// Application logic for encryption/decryption
document.addEventListener('DOMContentLoaded', () => {
    const encryptBtn = document.getElementById('encryptBtn');
    const decryptBtn = document.getElementById('decryptBtn');
    const encryptInput = document.getElementById('encryptInput');
    const decryptInput = document.getElementById('decryptInput');
    const encryptOutput = document.getElementById('encryptOutput');
    const decryptOutput = document.getElementById('decryptOutput');

    // Simple encryption function (Base64 encoding for demo)
    function encrypt(text) {
        try {
            return btoa(unescape(encodeURIComponent(text)));
        } catch (e) {
            return null;
        }
    }

    // Simple decryption function (Base64 decoding for demo)
    function decrypt(text) {
        try {
            return decodeURIComponent(escape(atob(text)));
        } catch (e) {
            return null;
        }
    }

    // Encrypt button handler
    if (encryptBtn) {
        encryptBtn.addEventListener('click', () => {
            const text = encryptInput.value.trim();
            
            if (!text) {
                encryptOutput.innerHTML = '<span class="error">Please enter text to encrypt</span>';
                return;
            }

            const encrypted = encrypt(text);
            
            if (encrypted) {
                encryptOutput.innerHTML = `
                    <div class="success">
                        <strong>Encrypted:</strong><br>
                        <code>${encrypted}</code>
                        <button class="btn-copy" onclick="copyToClipboard('${encrypted}')">Copy</button>
                    </div>
                `;
            } else {
                encryptOutput.innerHTML = '<span class="error">Encryption failed</span>';
            }
        });
    }

    // Decrypt button handler
    if (decryptBtn) {
        decryptBtn.addEventListener('click', () => {
            const text = decryptInput.value.trim();
            
            if (!text) {
                decryptOutput.innerHTML = '<span class="error">Please enter text to decrypt</span>';
                return;
            }

            const decrypted = decrypt(text);
            
            if (decrypted) {
                decryptOutput.innerHTML = `
                    <div class="success">
                        <strong>Decrypted:</strong><br>
                        <code>${decrypted}</code>
                        <button class="btn-copy" onclick="copyToClipboard('${decrypted}')">Copy</button>
                    </div>
                `;
            } else {
                decryptOutput.innerHTML = '<span class="error">Decryption failed - invalid encrypted text</span>';
            }
        });
    }
});

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
