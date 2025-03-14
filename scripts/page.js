import { showPhoneAlert } from "./alerts.js";

export function redirect(url) {
    saveAudioState();

    const passageCount = Number(localStorage.getItem("passageCount") ?? '0');
    const newPassageCount = passageCount + 1;
    localStorage.setItem("passageCount", newPassageCount);

    fadeOutOverlay();
    window.location.href = url;
    trackHistory(url);

    //TODO: every redirect increases the 'time' that has passed. 
}

function getPhoneContent(id) {
    switch (id) {
        case 1:
            return `HEALTHIEST GOBLIN HEADLINE ${id}`
        case 2:
            return `HEALTHIEST GOBLIN HEADLINE ${id}`
        case 3:
            return `HEALTHIEST GOBLIN HEADLINE ${id}`
        case 4:
            return `HEALTHIEST GOBLIN HEADLINE ${id}`
        case 5:
            return `HEALTHIEST GOBLIN HEADLINE ${id}`
        default:
            return null;
    }
}

function getPhoneAlertMessage(id) {
    switch (id) {
        case 1:
            return `HEALTHIEST GOBLIN HEADLINE ${id}`
        case 2:
            return `HEALTHIEST GOBLIN HEADLINE ${id}`
        case 3:
            return `HEALTHIEST GOBLIN HEADLINE ${id}`
        case 4:
            return `HEALTHIEST GOBLIN HEADLINE ${id}`
        case 5:
            return `HEALTHIEST GOBLIN HEADLINE ${id}`
        default:
            return null;
    }
}

export function fadeInOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("hide");
    overlay.classList.add("show");
    checkAudio();

    const passageCount = Number(localStorage.getItem("passageCount") ?? '0');

    if (passageCount > 0 && passageCount % 3 == 0) {
        const phoneItems = JSON.parse(localStorage.getItem('phoneItems'));
        const phoneItemId = Math.floor(passageCount / 3);
        const newPhoneContent = getPhoneContent(phoneItemId);
        if (newPhoneContent && phoneItems.every(e => e.id != phoneItemId)) {
            phoneItems.push({ id: phoneItemId, content: newPhoneContent, isRead: false });
            localStorage.setItem('phoneItems', JSON.stringify(phoneItems));
        }

        const alertMessage = getPhoneAlertMessage(phoneItemId);
        showPhoneAlert(alertMessage);
    }
}

export function fadeOutOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("show");
    overlay.classList.add("hide");
}

export function trackHistory(url) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.push(url);
    localStorage.setItem("history", JSON.stringify(history));
}

export function clearChoice(id) {
    const el = document.getElementById(id);
    el.style.display = 'none';
}

export function invert() {
    const el = document.getElementById('overlay');
    el.style.filter = 'invert(1)';
}
