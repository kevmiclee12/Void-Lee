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

/*
-------------------------
        VARIABLES
-------------------------
*/

const stats = {
    athletics: 0,
    shitheadedness: 0,
    bluemagic: 0,
    will: 0
}

const items = {};

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
    const newItems = JSON.parse(localStorage.getItem("items"));
    const history = JSON.parse(localStorage.getItem("history"));


    console.log(newStats)
    console.log(newItems)
    console.log(history)
});

function addItem(name, overrideId) {
    //TODO: add item sound
    const newItems = JSON.parse(localStorage.getItem("items"));
    const id = name.replace(/ /g, '');

    newItems[id] = (newItems[id] || 0) + 1;

    localStorage.setItem("items", JSON.stringify(newItems));


    if (overrideId) {
        const elements = document.querySelectorAll(`#${overrideId} a`);
        elements.forEach(el => {
            el.style.display = 'none';
        })
    } else {
        const element = document.querySelector(`#delayedMessage a`);
        element.style.display = "none";

    }

    console.log('ITEM: ', name)

    showSnackbar(`You got +1 <strong>${name}</strong>`)
}

function trackHistory(url) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.push(url);
    localStorage.setItem("history", JSON.stringify(history));
}

function startGame() {
    fadeInOverlay();
    localStorage.setItem("stats", JSON.stringify(stats));
    localStorage.setItem("items", JSON.stringify(items));
    localStorage.setItem("history", JSON.stringify([]));


    playText(() => showBottomChoices(), null, 'title');
    playAudio('resources/audio/intro.mp3', true, true, 0.3);
}


/*
------------------------------------
        ANIMATED TEXT ELEMENTS
------------------------------------
*/

let timeoutIds = [];
let timeoutFns = [];

function getPlayTextSpeed(id) {
    if (id == 'title') {
        return 0.5;
    }
    return 0.03;
}

function getPlayTextWidth(id) {
    if (id == 'title') {
        return null;
    } else if (id.includes('long')) {
        return window.innerWidth * 0.62;
    }
    return window.innerWidth * 0.8;
}

window.playText = function (onEnd, choice, overrideId) {
    const id = overrideId ?? `main${narrativeCount}`;
    console.log(id);
    const fadeTextElements = document.querySelectorAll(`#${id}`);
    const speed = getPlayTextSpeed(id);
    const maxWidth = getPlayTextWidth(id);


    if (onEnd && fadeTextElements.length > 0) {
        const text = fadeTextElements[0].dataset.text;
        const textLength = text.length;
        let timeoutId = setTimeout(function () {
            timeoutIds = timeoutIds.filter(e => e !== timeoutId);
            timeoutFns = timeoutFns.filter(e => e !== onEnd);
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
            let skip = false;
            let specialCharacters = ['`', '~']
            let choiceIndex;
            let newHtml = text
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

                    if (char == '{') {
                        choiceIndex = index;
                        skip = true
                    }

                    if (char == '}') {
                        skip = false;
                    }

                    if (skip) {
                        return char;
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
                .join("")

            if (choice) {
                element.innerHTML = newHtml
                    .replace(/{/g, `<span style="animation-delay: ${choiceIndex * speed}s;"><a class="choice-button" onClick="${choice}">`)
                    .replace('}', '</a></span>');
            } else {
                element.innerHTML = newHtml
            }


            if (maxWidth) {
                insertLineBreaks(element, maxWidth);
            }
        }
    });

    if (!overrideId) {
        narrativeCount += 1;
    }
};

function insertLineBreaks(element, maxWidth) {
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

function showBottomChoices() {
    const delayedMessage = document.getElementById('delayedMessage');
    if (delayedMessage) {
        delayedMessage.style.visibility = 'visible';
    }
}

let narrativeCount = 0;

window.createNarrative = function (dialogText) {
    const text = document.createElement('p');
    text.id = `main${narrativeCount}`;
    text.classList.add('dialog-text');
    text.classList.add('movable-text');
    dialogText = dialogText.replace(/\n/g, ' ');
    text.setAttribute('data-text', dialogText);

    const bounceText = document.createElement('p');
    bounceText.id = `main${narrativeCount}`;
    bounceText.classList.add('dialog-text-bounce');
    bounceText.classList.add('movable-text');
    bounceText.setAttribute('data-text', dialogText);

    const story = document.getElementById('story');

    text.style.animation = 'wobble 2.0s infinite';
    text.style.opacity = 1;
    text.style.left = '10vw';
    text.style.top = `1vw`;
    bounceText.style.animation = 'dialog-shift 3.5s infinite, wobble 2.0s infinite';
    bounceText.style.opacity = 1;
    bounceText.style.left = '10vw';
    bounceText.style.top = `1vw`

    story.appendChild(text);
    story.appendChild(bounceText);
}

window.createDialog = function (dialogType, avatarType, dialogText, onClick) {

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



    if (avatarType != 'none') {
        story.appendChild(avatar);
    }
    story.appendChild(text);
    story.appendChild(bounceText);
}

window.dismissDialog = function (id, textOnly) {
    console.log(`dismiss ${id ?? `main${narrativeCount - 1}`}`)
    const removeItems = [...document.querySelectorAll(`#${id ?? `main${narrativeCount - 1}`}`), ...document.querySelectorAll(`#dialog`)];

    console.log(textOnly)
    if (!textOnly) {
        console.log(document.querySelectorAll(`#avatar`));
        removeItems.push(...document.querySelectorAll(`#avatar`))
    }

    removeItems.forEach(el => el.remove());
}

window.shiftDialog = function (id) {
    document.querySelectorAll(`#${id}`).forEach(el => {
        el.classList.add('clicked')
    })
}

function checkItemHistory(item, page) {
    const checkItems = JSON.parse(localStorage.getItem("items"));
    const history = JSON.parse(localStorage.getItem("history"));

    console.log(checkItems[item]);
    console.log(`EXISTS? ${history.some(e => e.includes(page))}`);

    if (checkItems[item] && history.some(e => e.includes(page))) {
        const element = document.querySelector("#delayedMessage a");
        element.style.display = "none";
    }
}

/*
------------------------
        AUDIO
------------------------
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

window.onbeforeunload = function () {
    console.log('checking audio');
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
};

/*
------------------------
        ALERTS
------------------------
*/

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

function showSnackbar(message, duration = 4000) {
    console.log('SHOW ', message)
    const alertBox = document.getElementById("custom-alert");
    const messageBox = document.getElementById("alert-message");
    messageBox.innerHTML = message;

    console.log(alertBox)

    alertBox.classList.add("show");

    setTimeout(() => {
        alertBox.classList.add("hide");

        setTimeout(() => {
            alertBox.classList.remove("show", "hide");
        }, 500);
    }, duration);
}

/*
----------------------------
        PAGE ACTIONS
----------------------------
*/

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

    trackHistory(url)
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
    console.log('try finish text')
    if (timeoutIds.length > 0 || timeoutFns.length > 0) {
        console.log('run finsihed text');
        const elements = [...document.querySelectorAll('span'), ...document.querySelectorAll('a')];
        elements.forEach(span => {
            span.style.animationDelay = '0s'
        })
        console.log(`ONTIMEOUT FNS:`, timeoutFns);
        console.log(`TIMEOUTIDS: ${timeoutIds}`);
        for (let i = 0; i < timeoutIds.length; i++) {
            clearTimeout(timeoutIds[i]);
            timeoutIds.splice(i, 1);
        }

        for (let i = 0; i < timeoutFns.length; i++) {
            timeoutFns[i]();
            timeoutFns.splice(i, 1);
        }
    }
}

function skillRoll(stat, onSuccess, onFailure) {
    const statValue = JSON.parse(localStorage.getItem("stats"))[stat];
    // baseline + (stat * multipler)
    const successRate = 0.1 + (statValue * 0.3);
    const roll = Math.random();
    console.log(roll);
    console.log(successRate);
    if (successRate > 1 || roll < successRate) {
        onSuccess();
    } else {
        onFailure();
    }

    //TODO: succeed with style?
    //TODO: Catastrophic failure?
}




