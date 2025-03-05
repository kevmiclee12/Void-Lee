export function redirect(url) {
    saveAudioState();
    const passageCount = Number(localStorage.getItem("passageCount") ?? '0');
    const newPassageCount = passageCount + 1;
    localStorage.setItem("passageCount", newPassageCount);
    localStorage.setItem("hasReadPhone", false);


    if (newPassageCount % 3 == 0) {
        localStorage.setItem("hasNewPhoneItem", true);
    }

    fadeOutOverlay();
    window.location.href = url;
    trackHistory(url);

    //TODO: every redirect increases the 'time' that has passed. 
}

export function fadeInOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("hide");
    overlay.classList.add("show");
    checkAudio();
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
