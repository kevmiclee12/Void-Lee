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

export function showSnackbar(message, duration = 4000, callBack) {
    const alertBox = document.getElementById("custom-alert");
    const messageBox = document.createElement("p");
    console.log('message: ', message);
    messageBox.innerHTML = message;

    alertBox.appendChild(messageBox)

    console.log('mbox: ', messageBox)

    alertBox.classList.add("show");

    setTimeout(() => {
        alertBox.classList.add("hide");

        setTimeout(() => {
            alertBox.classList.remove("show", "hide");
            if (callBack) {
                callBack();
            }
        }, 500);
    }, duration);
}

export function showPhoneAlert(message) {
    //TODO: play phone alert sound
    const alertBox = document.getElementById("phone-alert");
    alertBox.innerHTML = `
    <div style="width: 432px">
        <p style="font-weight: bold">Meme Screen News Alert</p>
        <p>${message}</p>
    </div>`;

    alertBox.classList.add("show");

    setTimeout(() => {
        alertBox.classList.add("hide");

        setTimeout(() => {
            alertBox.classList.remove("show", "hide");
        }, 500);
    }, 5000);
}

export function dismissPhoneAlert() {
    const alertBox = document.getElementById("phone-alert");
    if (alertBox) {
        alertBox.classList.remove("show", "hide");
    }
}