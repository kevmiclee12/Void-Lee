const DIALOG_BOX_LONG = "../resources/images/dialogs/dialog-box-long.png"
const MUD_MAN = "../resources/images/avatars/mud-man.png"
const DRUNK_1 = "../resources/images/avatars/drunk1.png"
const DRUNK_2 = "../resources/images/avatars/drunk2.png"


const DIALOG_BOX_MAP = {
    'long': {
        'src': DIALOG_BOX_LONG,
        'class': 'dialog-box-long',
    },
    'none': {

    },
    'main': {

    },
}

const AVATAR_MAP = {
    'mud_man': MUD_MAN,
    'drunk1': DRUNK_1,
    'drunk2': DRUNK_2
}

const stats = {
    athletics: 0,
    shitheadedness: 0,
    bluemagic: 0,
    will: 0
}

function increaseStat(name, amount) {
    const newStats = JSON.parse(localStorage.getItem("stats"));

    console.log(`increase ${name} by ${amount}`)
    newStats[name] += amount;

    console.log(newStats)

    localStorage.setItem("stats", JSON.stringify(newStats));
}

function setDrunkChoice(choice) {
    localStorage.setItem("drunkChoide", choice)
}

document.addEventListener("DOMContentLoaded", (event) => {
    const newStats = JSON.parse(localStorage.getItem("stats"));

    console.log(newStats)
});

/*
Plays the fade in text effect at the specified speed.
*/
let timeoutIds = [];
let timeoutFns = [];
window.playText = function (speed, maxWidth, onEnd, id) {
    const fadeTextElements = document.querySelectorAll(`#${id}`)

    if (onEnd && fadeTextElements.length > 0) {
        const text = fadeTextElements[0].dataset.text;
        const textLength = text.length;
        let timeoutId = setTimeout(function () {
            timeoutIds = [];
            timeoutFns = [];
            onEnd();
        }, (speed * textLength) * 1000);
        timeoutIds.push(timeoutId);
        timeoutFns.push(onEnd);
    }

    fadeTextElements.forEach((element) => {
        const text = element.dataset.text;
        if (text) {
            let bold = false;
            let italic = false;
            let specialCharacters = ['`', '~']
            element.innerHTML = text
                .replace(/(<b>|<\/b>)/g, '~')
                .replace(/(<i>|<\/i>)/g, '`')
                .split("")
                .map((char, index) => {

                    const animation = `animation-delay: ${index * speed}s;`;

                    if (char == '~') {
                        bold = !bold;
                    }

                    if (char == '`') {
                        italic = !italic;
                    }


                    if (bold && italic && !specialCharacters.includes(char)) {
                        return `<span style="animation-delay: ${index * speed}s; font-style: italic; font-weight: bold">${char}</span>`;
                    }

                    if (bold && !specialCharacters.includes(char)) {
                        return `<span style="animation-delay: ${index * speed}s; font-weight: bold">${char}</span>`;
                    }

                    if (italic && !specialCharacters.includes(char)) {
                        return `<span style="animation-delay: ${index * speed}s; font-style: italic">${char}</span>`;
                    }

                    if (char === " ") {
                        return `<span style="${animation}">&nbsp;</span>`;
                    }



                    if (!specialCharacters.includes(char)) {
                        return `<span style="${animation}">${char}</span>`;
                    }
                })
                .join("");

            if (maxWidth) {
                const spans = element.querySelectorAll('span');

                let lastSpaceIndex = -1;
                let totalWidth = 0;

                for (let index = 0; index < spans.length; index++) {
                    const span = spans[index]
                    totalWidth += span.offsetWidth;

                    if (span.innerHTML == '^') {
                        totalWidth = 0;
                        lastSpaceIndex = -1
                        const br = document.createElement('br');
                        spans[index].insertAdjacentElement('beforebegin', br);
                        spans[index].remove();
                    }

                    if (totalWidth > maxWidth && span.innerHTML == '&nbsp;') {
                        const br = document.createElement('br');
                        spans[lastSpaceIndex].insertAdjacentElement('afterend', br);
                        totalWidth = 0;
                        index = lastSpaceIndex - 1
                        lastSpaceIndex = -1
                    }
                    if (span.innerHTML === '&nbsp;') {
                        lastSpaceIndex = index
                    }
                }
            }
        }
    })
};

/*
Plays audio from the specified url.
Options for infinte loop and fade in effect.
*/
const activeAudios = [];
let audio;

window.playAudio = function (audioUrl, loop, fadeIn, buffer) {
    audio = new Audio(audioUrl);

    if (loop) {
        audio.loop = loop;
    }

    if (buffer) {
        audio.addEventListener('timeupdate', function () {
            if (this.currentTime > this.duration - buffer) {
                this.currentTime = 0
                this.play();
            }
        });
    }


    if (fadeIn) {
        audio.volume = 0;
        var isFirstIteration = true;
        audio.play();

        function fadeInVolume() {
            if (isFirstIteration) {
                var fadeDuration = 5;
                var interval = 50;
                var step = (1 / fadeDuration) * (interval / 1000);
                var currentVolume = audio.volume;

                var fadeInterval = setInterval(function () {
                    if (currentVolume < 1) {
                        currentVolume += step;
                        audio.volume = Math.min(currentVolume, 1);
                    } else {
                        clearInterval(fadeInterval);
                        isFirstIteration = false;
                    }
                }, interval);
            }
        }
        audio.addEventListener('play', fadeInVolume);
    } else {
        // just play
        audio.play();
    }

    activeAudios.push({
        audioUrl: audioUrl,
        audio: audio,
    });
}


window.stopAudio = function () {
    audio.pause();
}

function redirect(url) {

    fadeOutOverlay();

    if (audio) {
        const fadeDuration = 1000;
        const interval = 50;
        const fadeStep = audio.volume / (fadeDuration / interval);

        const fadeOut = setInterval(() => {
            if (audio.volume > 0) {
                audio.volume = Math.max(0, audio.volume - fadeStep);
            } else {
                clearInterval(fadeOut);
                audio.pause();
                window.location.href = url
            }
        }, interval);
    } else {
        window.location.href = url
    }
}


window.createDialogComponent = function (dialogType, avatarType, dialogText, onClick) {

    const dialogBoxWrapper = document.createElement('div')
    const dialogBox = document.createElement('img');
    const avatar = document.createElement('img');


    if (avatarType != 'none') {
        const avatarData = AVATAR_MAP[avatarType];
        avatar.src = avatarData;
        avatar.id = 'avatar';
        avatar.classList.add('dialog-avatar');
    }

    const text = document.createElement('p');
    text.id = dialogType;
    text.classList.add('dialog-text');
    text.classList.add('movable-text');
    text.setAttribute('data-text', dialogText);

    const bounceText = document.createElement('p');
    bounceText.id = dialogType;
    bounceText.classList.add('dialog-text-bounce');
    bounceText.classList.add('movable-text');
    bounceText.setAttribute('data-text', dialogText);

    const story = document.getElementById('story');

    if (!dialogType.includes('main')) {
        const dialogData = DIALOG_BOX_MAP[dialogType];
        dialogBox.src = dialogData.src
        dialogBox.classList.add(dialogData.class);
        dialogBox.classList.add('movable');
        dialogBoxWrapper.id = dialogType;
        dialogBoxWrapper.style.curosor = 'pointer';
        dialogBoxWrapper.style.display = 'inline-block';
        dialogBoxWrapper.style.width = '100%'
        dialogBoxWrapper.classList.add('movable');
        dialogBoxWrapper.onclick = function () {
            onClick();
        };
        dialogBoxWrapper.appendChild(dialogBox);
        story.appendChild(dialogBoxWrapper);
    } else {
        text.style.animation = 'wobble 2.0s infinite';
        text.style.opacity = 1;
        text.style.left = '10vw';
        text.style.top = `5vw`;
        bounceText.style.animation = 'dialog-shift 3.5s infinite, wobble 2.0s infinite';
        bounceText.style.opacity = 1;
        bounceText.style.left = '10vw';
        bounceText.style.top = `5vw`
    }


    if (avatarType != 'none') {
        story.appendChild(avatar);
    }
    story.appendChild(text);
    story.appendChild(bounceText);
}

window.dismissDialog = function (id, textOnly) {
    const removeItems = [...document.querySelectorAll(`#${id}`), ...document.querySelectorAll(`#dialog`)];

    if (!textOnly) {
        removeItems.push(...document.querySelectorAll(`#avatar`))
    }

    removeItems.forEach(el => el.remove());
}

window.shiftDialog = function (id) {
    document.querySelectorAll(`#${id}`).forEach(el => {
        el.classList.add('clicked')
    })
}

window.addChoice = function (html, id) {
    const dialog = document.getElementById(id);
    dialog.insertAdjacentHTML('beforeend', html)
}

function showCustomAlert(message) {
    const alertBox = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.innerHTML = message;
    alertBox.style.display = 'flex';
}

function closeCustomAlert(callback) {
    const alertBox = document.getElementById('customAlert');
    alertBox.style.display = 'none';
    callback();
}

function startGame() {
    fadeInOverlay();
    localStorage.setItem("stats", JSON.stringify(stats))
    playText(0.5, null, onEnd => {
        const delayedMessage = document.getElementById('delayedMessage');
        if (delayedMessage) {
            delayedMessage.style.visibility = 'visible';
        }
    }, 'title');
    playAudio('resources/audio/intro.mp3', true, true, 0.3)
}

function fadeInOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("hide");
    overlay.classList.add("show");
}

function fadeOutOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("show");
    overlay.classList.add("hide");
}


function finishText() {
    const elements = document.querySelectorAll('span');
    elements.forEach(span => {
        span.style.animationDelay = '0s'
    })
    console.log(timeoutIds)
    timeoutIds.forEach(id => {
        clearTimeout(id);
    })
    timeoutFns.forEach(fn => {
        fn();
    })
    timeoutIds = [];
    timeoutFns = [];
}
