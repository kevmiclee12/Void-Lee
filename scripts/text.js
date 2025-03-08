import { AVATAR_MAP, DIALOG_BOX_MAP } from "./constants.js";


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


export function playText(onEnd, choices, overrideId) {
    const id = overrideId ?? `main${narrativeCount}`;
    const fadeTextElements = document.querySelectorAll(`#${id}`);
    const speed = getPlayTextSpeed(id);
    const maxWidth = getPlayTextWidth(id);

    if (fadeTextElements.length > 0) {
        const text = fadeTextElements[0].dataset.text;
        if (text) {
            const textLength = text.length;
            let timeoutId = setTimeout(function () {
                timeoutIds = timeoutIds.filter(e => e !== timeoutId);
                timeoutFns = timeoutFns.filter(e => e !== onEnd);
                if (onEnd) {
                    onEnd();
                }
            }, (speed * textLength) * 1000);
            timeoutIds.push(timeoutId);
            if (onEnd) {
                timeoutFns.push(onEnd);
            }
        }
    }

    fadeTextElements.forEach((element) => {
        const text = element.dataset.text;
        if (text) {
            let bold = false;
            let italic = false;
            let skip = false;
            let specialCharacters = ['`', '~']
            const choiceIndices = [];
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
                        choiceIndices.push(index)
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

            if (choices) {
                let i = 0;
                element.innerHTML = newHtml.split('').map((e) => {
                    let char = e;
                    if (e == '{') {
                        char = `<span style="animation-delay: ${choiceIndices[i] * speed}s;"><a class="choice-button" onClick="${choices[i]}">`;
                    }
                    if (e == '}') {
                        char = '</a></span>';
                        i++;
                    }
                    return char;
                }).join('');
            } else {
                element.innerHTML = newHtml
            }


            if (maxWidth) {
                insertLineBreaks(element, maxWidth);
            }
        }

        const lastLetter = element.querySelector("span:last-child");
        if (lastLetter) {
            lastLetter.addEventListener("animationend", () => {
                const dialogs = document.querySelectorAll("#long.movable");
                dialogs.forEach(e => {
                    e.style.pointerEvents = "auto";
                })
            });
        }
    });

    if (!overrideId) {
        narrativeCount += 1;
    }
};

export function finishText(additionalCallback) {
    const elements = [...document.querySelectorAll('span'), ...document.querySelectorAll('a')];
    elements.forEach(span => {
        span.style.animationDelay = '0s'
    })
    for (let i = 0; i < timeoutIds.length; i++) {
        clearTimeout(timeoutIds[i]);
        timeoutIds.splice(i, 1);
    }

    for (let i = 0; i < timeoutFns.length; i++) {
        timeoutFns[i]();
    }
    timeoutFns = [];

    const dialogs = document.querySelectorAll("#long.movable");
    dialogs.forEach(e => {
        e.style.pointerEvents = "auto";
    })

    if (additionalCallback) {
        additionalCallback();
    }

    const sidebar = document.getElementById("sidebar")
    if (sidebar.classList.contains("open")) {
        sidebar.classList.toggle("open");
    }
}

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

export function showBottomChoices(choices, isHome, isRight) {
    if (isHome) {
        const delayedMessage = document.getElementById('delayedMessage');
        if (delayedMessage) {
            delayedMessage.style.visibility = 'visible';
        }
    } else {
        const dialogBoxWrapper = document.createElement('div')
        const dialogBox = document.createElement('div');
        const avatar = document.createElement('img');

        const avatarData = AVATAR_MAP['player'];
        avatar.src = avatarData['image'];
        avatar.id = 'avatar';
        avatar.classList.add('dialog-avatar');
        if (rightAlignUserAvatar) {
            avatar.style.left = '70vw';
            avatar.style.transform = 'scaleX(-1)';
        }

        choices.forEach((choice, index) => {
            const button = document.createElement('a');
            button.classList.add('choice-button');
            button.innerHTML = choice.label.replace(/(<span>)/g, '<span style="color: black">')

            button.setAttribute("onclick", choice.onClick);
            const lineBreak = document.createElement('div');
            lineBreak.style.height = '8px';
            dialogBox.appendChild(button);
            if (index < choices.length - 1) {
                dialogBox.appendChild(lineBreak);
            }
        })

        const story = document.getElementById('story');

        dialogBox.classList.add('dialog-text');
        dialogBoxWrapper.id = 'choices';
        dialogBox.style.whiteSpace = 'normal';

        dialogBoxWrapper.appendChild(dialogBox);
        story.appendChild(dialogBoxWrapper);

        story.appendChild(avatar);
    }

}

export function hideBottomChoices() {
    const choices = document.getElementById('choices');
    choices.style.visibility = 'hidden';

    const avatars = document.querySelectorAll(`#avatar`)

    avatars.forEach(el => el.remove());
}



let narrativeCount = 0;

export function createNarrative(dialogText) {
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
    text.style.top = `0vw`;
    text.style.bottom = 'auto';

    bounceText.style.animation = 'dialog-shift 3.5s infinite, wobble 2.0s infinite';
    bounceText.style.opacity = 1;
    bounceText.style.left = '10vw';
    bounceText.style.top = `0vw`
    bounceText.style.bottom = 'auto';

    story.appendChild(text);
    story.appendChild(bounceText);
}

export function createDialog(dialogType, avatarType, dialogText, onClick, playSound) {

    const dialogBoxWrapper = document.createElement('div')
    const dialogBox = document.createElement('div');
    const avatar = document.createElement('img');


    const avatarData = AVATAR_MAP[avatarType];
    avatar.src = avatarData['image'];
    avatar.id = 'avatar';
    avatar.classList.add('dialog-avatar');

    const text = document.createElement('p');
    text.id = dialogType;
    text.classList.add('dialog-text');
    text.classList.add('movable-text');
    text.setAttribute('data-text', `~${avatarData['name']}~^^${dialogText}`);

    const bounceText = document.createElement('p');
    bounceText.id = dialogType;
    bounceText.classList.add('dialog-text-bounce');
    bounceText.classList.add('movable-text');
    bounceText.setAttribute('data-text', dialogText);

    const story = document.getElementById('story');


    const dialogData = DIALOG_BOX_MAP[dialogType];
    // dialogBox.src = dialogData.src
    dialogBox.classList.add(dialogData.class);
    dialogBox.classList.add('movable');
    dialogBox.style.cursor = 'pointer';

    dialogBoxWrapper.id = dialogType;
    dialogBoxWrapper.style.cursor = 'pointer';
    dialogBoxWrapper.style.display = 'inline-block';
    dialogBoxWrapper.style.width = '100%'
    dialogBoxWrapper.classList.add('movable');
    dialogBoxWrapper.style.pointerEvents = 'none';
    dialogBoxWrapper.onclick = function (event) {
        event.stopPropagation();
        onClick();
    };
    dialogBoxWrapper.appendChild(dialogBox);
    story.appendChild(dialogBoxWrapper);



    if (avatarType != 'none') {
        story.appendChild(avatar);
    }
    story.appendChild(text);
    story.appendChild(bounceText);

    if (playSound) {
        const audio = new Audio(`../resources/audio/${avatarType}.mp3`);
        setTimeout(function () {
            audio.play();
        }, 800);
    }

    playText(null, null, dialogType);
}

let rightAlignUserAvatar = false;

export function dismissDialog(id, textOnly) {
    const removeItems = [...document.querySelectorAll(`#${id ?? `main${narrativeCount - 1}`}`), ...document.querySelectorAll(`#dialog`)];

    if (!textOnly) {
        removeItems.push(...document.querySelectorAll(`#avatar`))
    }

    removeItems.forEach(el => el.remove());
    rightAlignUserAvatar = false;
}

export function shiftDialog(id) {
    document.querySelectorAll(`#${id}`).forEach(el => {
        el.classList.add('clicked')
    })
    rightAlignUserAvatar = true;
}

const sinkPassages = ['climb', 'sleep-dream.', 'sleep-dream1.', 'swing-it', 'tree-chase', 'faeries-']

