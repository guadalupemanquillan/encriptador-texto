const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const encryptBtn = document.getElementById('encrypt-btn');
const decryptBtn = document.getElementById('decrypt-btn');
const copyBtn = document.getElementById('copy-btn');
const modeSelect = document.getElementById('mode-select');
const statusEl = document.getElementById('status');
const themeToggle = document.getElementById('theme-toggle');
const soundToggle = document.getElementById('sound-toggle');

let soundEnabled = true;
let clickSound, successSound;

if (window.Howl) {
    clickSound = new Howl({
        src: ['tunetank-kids-logo-483658.mp3'],
        volume: 0.4
    });

    successSound = new Howl({
        src: ['tunetank-kids-logo-483658.mp3'],
        volume: 0.45
    });
}

// Base64: soporta tildes, ñ, etc.
function toBase64(text) {
    return btoa(unescape(encodeURIComponent(text)));
}

function fromBase64(text) {
    return decodeURIComponent(escape(atob(text)));
}

// Sustitución tipo desafío Alura
function encryptAlura(text) {
    return text
        .replace(/e/g, 'enter')
        .replace(/i/g, 'imes')
        .replace(/a/g, 'ai')
        .replace(/o/g, 'ober')
        .replace(/u/g, 'ufat');
}

function decryptAlura(text) {
    return text
        .replace(/enter/g, 'e')
        .replace(/imes/g, 'i')
        .replace(/ai/g, 'a')
        .replace(/ober/g, 'o')
        .replace(/ufat/g, 'u');
}

function currentMode() {
    return modeSelect ? modeSelect.value : 'base64';
}

function encrypt(text) {
    const mode = currentMode();
    if (mode === 'alura') {
        return encryptAlura(text);
    }
    return toBase64(text);
}

function isEncrypted(text) {
    if (!text) return false;
    const mode = currentMode();
    try {
        if (mode === 'alura') {
            const decrypted = decryptAlura(text);
            return decrypted !== text && encryptAlura(decrypted) === text;
        } else {
            const decoded = fromBase64(text);
            return toBase64(decoded) === text;
        }
    } catch (e) {
        return false;
    }
}

function decrypt(text) {
    const mode = currentMode();
    try {
        if (mode === 'alura') {
            const decrypted = decryptAlura(text);
            if (encryptAlura(decrypted) === text) {
                return decrypted;
            }
            return text;
        } else {
            const decoded = fromBase64(text);
            if (toBase64(decoded) === text) {
                return decoded;
            }
            return text;
        }
    } catch (e) {
        return text;
    }
}

function setStatus(message, type = 'info') {
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.classList.remove('status--success', 'status--error', 'status--info');
    if (message) {
        statusEl.classList.add(`status--${type}`);
    }
}

function playClick() {
    if (!soundEnabled || !clickSound) return;
    clickSound.play();
}

function playSuccess() {
    if (!soundEnabled || !successSound) return;
    successSound.play();
}

function updateButtons() {
    const hasInput = inputText.value.trim().length > 0;
    const output = outputText.value.trim();
    const outputIsEncrypted = isEncrypted(output);

    if (outputIsEncrypted) {
        // Hay texto encriptado listo para desencriptar
        decryptBtn.disabled = false;
        decryptBtn.classList.remove('secondary');

        encryptBtn.disabled = !hasInput;
        encryptBtn.classList.add('secondary');
    } else if (hasInput) {
        // Hay texto para encriptar
        encryptBtn.disabled = false;
        encryptBtn.classList.remove('secondary');

        decryptBtn.disabled = true;
        decryptBtn.classList.add('secondary');
    } else {
        // Nada que hacer
        encryptBtn.disabled = true;
        encryptBtn.classList.add('secondary');

        decryptBtn.disabled = true;
        decryptBtn.classList.add('secondary');
    }

    if (copyBtn) {
        copyBtn.disabled = output.length === 0;
    }
}

encryptBtn.addEventListener('click', () => {
    const text = inputText.value.trim();
    if (!text) {
        setStatus('Ingresa un texto para encriptar.', 'error');
        return;
    }
    if (text.length > 500) {
        setStatus('El texto es muy largo (máx. 500 caracteres).', 'error');
        return;
    }
    const encrypted = encrypt(text);
    outputText.value = encrypted;
    addToHistory('encrypt', text, encrypted);
    setStatus('Texto encriptado correctamente.', 'success');
    playSuccess();
    updateButtons();
});

decryptBtn.addEventListener('click', () => {
    const text = outputText.value.trim();
    if (!text) {
        setStatus('No hay texto para desencriptar.', 'error');
        return;
    }
    if (!isEncrypted(text)) {
        setStatus('El texto ya parece estar desencriptado.', 'info');
        updateButtons();
        return;
    }
    const decrypted = decrypt(text);
    outputText.value = decrypted;
    addToHistory('decrypt', text, decrypted);
    setStatus('Texto desencriptado correctamente.', 'success');
    playSuccess();
    updateButtons();
});

if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
        const text = outputText.value;
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setStatus('Texto copiado al portapapeles.', 'success');
            playClick();
        } catch (e) {
            setStatus('No se pudo copiar el texto.', 'error');
        }
    });
}

inputText.addEventListener('input', () => {
    setStatus('');
    updateButtons();
});

outputText.addEventListener('input', updateButtons);

if (modeSelect) {
    modeSelect.addEventListener('change', () => {
        setStatus(`Modo seleccionado: ${modeSelect.value === 'alura' ? 'Sustitución (Alura)' : 'Base64'}.`, 'info');
        updateButtons();
    });
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light');
        const isLight = document.body.classList.contains('light');
        themeToggle.textContent = isLight ? '☀️ Modo claro' : '🌙 Modo oscuro';
    });
}

if (soundToggle) {
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.textContent = soundEnabled ? '🔈 Sonido' : '🔇 Sin sonido';
    });
}

function addToHistory(type, fromText, toText) {
    const list = document.getElementById('history-list');
    if (!list) return;

    const li = document.createElement('li');
    li.className = 'history-item';

    const header = document.createElement('div');
    header.className = 'history-item-header';

    const typeBadge = document.createElement('span');
    typeBadge.className = 'history-type ' + (type === 'encrypt' ? 'encrypt' : 'decrypt');
    typeBadge.textContent = type === 'encrypt' ? 'Encriptar' : 'Desencriptar';

    const time = document.createElement('span');
    time.className = 'history-time';
    const now = new Date();
    time.textContent = now.toLocaleTimeString();

    header.appendChild(typeBadge);
    header.appendChild(time);

    const fromP = document.createElement('p');
    fromP.className = 'history-text';
    fromP.innerHTML = '<span class="label">De</span>' + (fromText || '&nbsp;');

    const toP = document.createElement('p');
    toP.className = 'history-text';
    toP.innerHTML = '<span class="label">A</span>' + (toText || '&nbsp;');

    li.appendChild(header);
    li.appendChild(fromP);
    li.appendChild(toP);

    list.insertBefore(li, list.firstChild);

    while (list.children.length > 10) {
        list.removeChild(list.lastChild);
    }
}

updateButtons();
