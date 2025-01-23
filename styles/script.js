const DIALOG_BOX_LONG = "../resources/images/dialogs/dialog-box-long.png"
const MUD_MAN = "../resources/images/avatars/mud-man.png"

const DIALOG_BOX_MAP = {
    'long': {
        'src': DIALOG_BOX_LONG,
        'class': 'dialog-box-long',
    }
}

const AVATAR_MAP = {
    'mud_man': MUD_MAN
}

// document.addEventListener("DOMContentLoaded", (event) => {
//     getBackgroundImage();
// });

/*
Plays the fade in text effect at the specified speed.
*/
window.playText = function (speed, maxWidth) {
    const fadeTextElements = [...document.querySelectorAll(".fade-text"), ...document.querySelectorAll(".dialog-text"), ...document.querySelectorAll(".dialog-text-bounce")];

    console.log(fadeTextElements.length);
    fadeTextElements.forEach((element) => {
        const text = element.dataset.text;
        const textLength = text.length;

        setTimeout(function () {
            const delayedMessage = document.getElementById('delayedMessage');
            if (delayedMessage) {
                delayedMessage.style.visibility = 'visible';
            }

        }, (speed * textLength) * 1000);

        let bold = false;
        let italic = false;
        let specialCharacters = ['`', '~', '#'];

        element.innerHTML = text
            .replace(/(<b>|<\/b>)/g, '~')
            .replace(/(<i>|<\/i>)/g, '`')
            .replace(/<br>/g, '#')
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

                if (char === '#') {
                    return `<br>`;
                }

                if (!specialCharacters.includes(char)) {
                    return `<span style="${animation}">${char}</span>`;
                }
            })
            .join("");

        if (maxWidth) {
            const spans = element.querySelectorAll('span');

            let totalWidth = 0;

            spans.forEach((span, index) => {
                totalWidth += span.offsetWidth;
                if (totalWidth > maxWidth && span.innerHTML == '&nbsp;') {
                    for (let i = index - 1; i >= 0; i--) {
                        if (spans[i].innerHTML === '&nbsp;') {
                            const br = document.createElement('br');
                            spans[i].insertAdjacentElement('afterend', br);
                            break;
                        }
                    }
                    totalWidth = 0;
                }
            });
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


window.createDialogComponent = function (dialogType, avatarType, dialogText, choicesHtml) {
    const dialogBox = document.createElement('img');
    const dialogData = DIALOG_BOX_MAP[dialogType];
    dialogBox.src = dialogData.src
    dialogBox.classList.add(dialogData.class);

    if (avatarType != 'none') {
        const avatar = document.createElement('img');
        const avatarData = AVATAR_MAP[avatarType];
        avatar.src = avatarData;
        avatar.classList.add('dialog-avatar');
    }

    const text = document.createElement('p');
    text.classList.add('dialog-text');
    text.setAttribute('data-text', dialogText);

    const bounceText = document.createElement('p');
    bounceText.classList.add('dialog-text-bounce');
    bounceText.setAttribute('data-text', dialogText);

    const story = document.getElementById('story');

    story.appendChild(dialogBox);
    if (avatarType != 'none') {
        story.appendChild(avatar);
    }
    story.appendChild(text);
    story.appendChild(bounceText);
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
    playText(0.5, null);
    playAudio('resources/audio/intro.mp3', true, true, 0.3)
}