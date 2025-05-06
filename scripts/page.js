import { showPhoneAlert } from "./alerts.js";

export function redirect(url, isAbsolute) {
    if (isAbsolute === undefined) {
        isAbsolute = true;
    }
    saveAudioState();

    const history = JSON.parse(localStorage.getItem("history")) || [];

    if (!history.includes(url) && !url.includes('intro')) {
        const passageCount = Number(localStorage.getItem("passageCount") ?? '0');
        const newPassageCount = passageCount + 1;
        localStorage.setItem("passageCount", newPassageCount);
    }

    fadeOutOverlay();
    const basePath = window.location.hostname === '127.0.0.1' ? '' : '/Void-Lee';

    window.location.href = `${basePath}/pages/${url}`;
    trackHistory(url);
    //TODO: every redirect increases the 'time' that has passed. 
}

function getPhoneContent(id) {
    switch (id) {
        case 1:
            return `New CDC director: Byron Leakschild.`
        case 2:
            return `CDC director declares sweeping staff cuts.`
        case 3:
            return `"Too many scientists, political bias, living off citizens.", Leakschild says.`
        case 4:
            return `"Too many maintenance workers and technicians." No one is safe from Leakschild's cuts.`
        case 5:
            return `"Infectious disease labs overstaffed", staff cuts imminent. Concerns for safety and protocol loom.`
        case 6: 
            return `CDC director finds 15 employees all whose job it is to maintain watch and status of world's healthiest goblin, "waste of taxpayer money".`
        case 7: 
            return `World's healthiest goblin escapes when the one employee left to maintain facility falls asleep. Leakschild blames "Shleepy Shoshana".`
        case 8: 
            return `Escaped goblin now believed to carry a single deadly disease per reports.`
        case 9: 
            return `Block your windows, quarantine in your homes, don't let the disease spread.`
        case 10: 
            return `Army deployed to contain outbreak. Shelter in palce.`
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
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const page = window.location.href;
    const alreadyVisited = history.filter(e => page.includes(e)).length > 1;

    if (passageCount > 0 && passageCount % 3 == 0 && !alreadyVisited) {
        const phoneItems = JSON.parse(localStorage.getItem('phoneItems'));
        const phoneItemId = Math.floor(passageCount / 3);
        const newPhoneContent = getPhoneContent(phoneItemId);
        if (newPhoneContent && phoneItems.every(e => e.id != phoneItemId)) {
            phoneItems.push({ id: phoneItemId, content: newPhoneContent, isRead: false });
            localStorage.setItem('phoneItems', JSON.stringify(phoneItems));
        }

        const alertMessage = getPhoneContent(phoneItemId);
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
