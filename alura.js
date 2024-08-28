// script.js
document.getElementById('encrypt-btn').addEventListener('click', () => {
    const text = document.getElementById('input-text').value;
    document.getElementById('output-text').value = encrypt(text);
});

document.getElementById('decrypt-btn').addEventListener('click', () => {
    const text = document.getElementById('input-text').value;
    document.getElementById('output-text').value = decrypt(text);
});

function encrypt(text) {
    // Implementar tu lógica de encriptación aquí
    return btoa(text); // Ejemplo simple usando base64
}

function decrypt(text) {
    // Implementar tu lógica de desencriptación aquí
    return atob(text); // Ejemplo simple usando base64
}
