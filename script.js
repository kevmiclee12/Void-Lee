import { increaseStat, skillRoll } from "./scripts/stats.js"
import { addItem, removeItem, checkItems } from "./scripts/items.js"
import { redirect, fadeInOverlay, clearChoice, invert } from "./scripts/page.js"
import { finishText, showBottomChoices, hideBottomChoices, createNarrative, createDialog, dismissDialog, shiftDialog, playText } from "./scripts/text.js"
import { playAudio, stopAudio, checkAudio, saveAudioState } from "./scripts/audio.js"
import { buildSidebar, toggleSidebar } from "./scripts/sidebar.js"
import { showCustomAlert, closeCustomAlert, showSnackbar } from "./scripts/alerts.js"

window.skillRoll = skillRoll;
window.increaseStat = increaseStat;

window.removeItem = removeItem;
window.checkItems = checkItems;
window.addItem = addItem;

window.redirect = redirect;
window.fadeInOverlay = fadeInOverlay;
window.clearChoice = clearChoice;
window.invert = invert;

window.finishText = finishText;
window.showBottomChoices = showBottomChoices;
window.hideBottomChoices = hideBottomChoices;
window.createNarrative = createNarrative;
window.createDialog = createDialog;
window.dismissDialog = dismissDialog;
window.shiftDialog = shiftDialog;
window.playText = playText;

window.playAudio = playAudio;
window.stopAudio = stopAudio;
window.checkAudio = checkAudio;
window.saveAudioState = saveAudioState;

window.buildSidebar = buildSidebar;
window.toggleSidebar = toggleSidebar;

window.showCustomAlert = showCustomAlert;
window.closeCustomAlert = closeCustomAlert;
window.showSnackbar = showSnackbar;


function startGame() {
    localStorage.clear();
    fadeInOverlay();
    localStorage.setItem("stats", JSON.stringify({
        athletics: 0,
        shitheadedness: 0,
        bluemagic: 0,
        will: 0
    }));
    localStorage.setItem("items", JSON.stringify([]));
    localStorage.setItem("history", JSON.stringify([]));
    localStorage.setItem("openedDict", JSON.stringify(false));
    localStorage.setItem("dictPages", JSON.stringify([]));
    localStorage.setItem("dictHistory", JSON.stringify([]));
    localStorage.setItem("partyStatus", '');
    localStorage.setItem("drunkChoice", '');
    localStorage.setItem("statChecks", JSON.stringify([]));
    localStorage.setItem("audioPath", '');
    localStorage.setItem("audioTime", null);
    localStorage.setItem("hasReadPhone", false);
    localStorage.setItem("hasNewPhoneItem", false);
    localStorage.setItem("caughtSquirrel", false);

    playText(() => showBottomChoices(), null, 'title');
    playAudio('resources/audio/intro.mp3', true, 5);
}
window.startGame = startGame;

