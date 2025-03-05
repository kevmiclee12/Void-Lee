export function showCustomAlert(message) {
    const alertBox = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.innerHTML = message;
    alertBox.style.display = 'flex';
}

export function closeCustomAlert(callback) {
    const alertBox = document.getElementById('customAlert');
    alertBox.style.display = 'none';
    callback();
}

export function showSnackbar(message, duration = 4000) {
    const alertBox = document.getElementById("custom-alert");
    const messageBox = document.getElementById("alert-message");
    messageBox.innerHTML = message;

    alertBox.classList.add("show");

    setTimeout(() => {
        alertBox.classList.add("hide");

        setTimeout(() => {
            alertBox.classList.remove("show", "hide");
        }, 500);
    }, duration);
}