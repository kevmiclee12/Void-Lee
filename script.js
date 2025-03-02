const DIALOG_BOX_LONG = "../resources/images/dialogs/dialog-box-long.png"
const MUD_MAN = "../resources/images/avatars/mud-man.png"
const DRUNK_1 = "../resources/images/avatars/drunk1.png"
const DRUNK_2 = "../resources/images/avatars/drunk2.png"
const FAERIE_1 = "../resources/images/avatars/faerie1.png"
const FAERIE_2 = "../resources/images/avatars/faerie2.png"
const FAERIE_3 = "../resources/images/avatars/faerie3.png"
const HYPNO_GOURD = "../resources/images/avatars/hypno-gourd.png"
const SQUIRREL = "../resources/images/avatars/squirrel.png"



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
    'drunk2': DRUNK_2,
    'faerie1': FAERIE_1,
    'faerie2': FAERIE_2,
    'faerie3': FAERIE_3,
    'hypno_gourd': HYPNO_GOURD,
    'squirrel': SQUIRREL
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

const statChecks = {};

const items = [];

function increaseStat(name, amount) {
    const newStats = JSON.parse(localStorage.getItem("stats"));
    const newStatChecks = JSON.parse(localStorage.getItem("statChecks")) ?? {};

    console.log(`CHECK: ${newStatChecks}`)

    const statCheck = newStatChecks[name] ?? [];

    if (!statCheck?.includes(window.location.href)) {
        console.log(`increase ${name} by ${amount}`)
        newStats[name] += amount;
        statCheck.push(window.location.href);
        newStatChecks[name] = statCheck;

        console.log(newStats)
        console.log(newStatChecks);

        localStorage.setItem("stats", JSON.stringify(newStats));
        localStorage.setItem("statChecks", JSON.stringify(newStatChecks));
    }
}

function setDrunkChoice(choice) {
    localStorage.setItem("drunkChoice", choice)
}

function updatePartyStatus(value) {
    localStorage.setItem('partyStatus', value);
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

    newItems.push(name);

    localStorage.setItem("items", JSON.stringify(newItems));

    if (overrideId) {
        const elements = document.querySelectorAll(`#${overrideId} a`);
        elements.forEach(el => {
            el.style.display = 'none';
        })
    } else {
        const element = document.querySelector(`#delayedMessage a`);
        if (element) {
            element.style.display = "none";
        }
    }
    showSnackbar(`You got +1 <strong>${name}</strong>`)
}

function removeItem(name, overrideId) {
    const newItems = JSON.parse(localStorage.getItem("items"));

    const index = newItems.indexOf(name);
    if (index !== -1) {
        newItems.splice(index, 1);
        localStorage.setItem("items", JSON.stringify(newItems));
    }

    showSnackbar(`-1 <strong>${name}</strong>`)
}

function checkItems(value) {
    const newItems = JSON.parse(localStorage.getItem("items"));
    return !newItems.includes(value);
}

function trackHistory(url) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.push(url);
    localStorage.setItem("history", JSON.stringify(history));
}

function startGame() {
    localStorage.clear();
    fadeInOverlay();
    localStorage.setItem("stats", JSON.stringify(stats));
    localStorage.setItem("items", JSON.stringify(items));
    localStorage.setItem("history", JSON.stringify([]));
    localStorage.setItem("openedDict", JSON.stringify(false));
    localStorage.setItem("dictPages", JSON.stringify([]));
    localStorage.setItem("dictHistory", JSON.stringify([]));
    localStorage.setItem("partyStatus", '');
    localStorage.setItem("drunkChoice", '');
    localStorage.setItem("statChecks", JSON.stringify([]));
    localStorage.setItem("audioPath", '');
    localStorage.setItem("audioTime", null);

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

window.createDialog = function (dialogType, avatarType, dialogText, onClick, playSound) {

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
        console.log('play sound!');
        const audio = new Audio(`../resources/audio/${avatarType}.mp3`);
        audio.play();
    }
}

window.dismissDialog = function (id, textOnly) {
    const removeItems = [...document.querySelectorAll(`#${id ?? `main${narrativeCount - 1}`}`), ...document.querySelectorAll(`#dialog`)];

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

/*
------------------------
        AUDIO
------------------------
*/
const activeAudios = [];
let audio;
let audioPath;

window.playAudio = function (audioUrl, loop, fadeIn, buffer) {

    if (audioUrl != audioPath) {
        audio = new Audio(audioUrl);
        audioPath = audioUrl;

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
            audio.play();
        }


        activeAudios.push({
            audioUrl: audioUrl,
            audio: audio,
        });
    }
}


function stopAudio() {
    if (audio) {
        console.log('Stopping audio!!!');
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

        audio = null;
    }
}


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

/*
----------------------------
        PAGE ACTIONS
----------------------------
*/

function redirect(url) {
    if (audio) {
        console.log('saving audio');
        sessionStorage.setItem("audioTime", audio.currentTime);
        sessionStorage.setItem("audioPath", audioPath);
    }
    fadeOutOverlay();
    window.location.href = url;
    trackHistory(url);

    //TODO: every redirect increases the 'time' that has passed. 
    //TODO: Every 2-3 passages puts a new notification on the phone and progress the phone story (if they've already viewed it)

    const passageCount = Number(localStorage.getItem("passageCount") ?? '0');
    const newPassageCount = passageCount + 1;
    localStorage.setItem("passageCount", newPassageCount);
}

function fadeInOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("hide");
    overlay.classList.add("show");

    checkAudio();
}

function checkAudio() {
    const url = window.location.href;
    const savedAudio = sessionStorage.getItem("audioPath")

    if (savedAudio) {
        if (url.includes('faeries')) {
            playAudio(savedAudio, false, false, 0.3);
            const savedTime = sessionStorage.getItem("audioTime");
            audio.currentTime = parseFloat(savedTime);
        }
    }


}

function fadeOutOverlay() {
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("show");
    overlay.classList.add("hide");
}

function finishText() {
    console.log('finishText');
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
        timeoutFns.splice(i, 1);
    }
}

function skillRoll(stat, onSuccess, onFailure) {
    const statValue = JSON.parse(localStorage.getItem("stats"))[stat];
    // baseline + (stat * multipler)
    const successRate = 0.1 + (statValue * 0.3);
    const roll = Math.random();
    if (successRate > 1 || roll < successRate) {
        onSuccess();
    } else {
        onFailure();
    }

    //TODO: succeed with style?
    //TODO: Catastrophic failure?
}

/*
----------------------------
        SIDE BAR
----------------------------
*/

function buildSidebar() {
    const story = document.getElementById('story');
    const openedDict = JSON.parse(localStorage.getItem("openedDict"));

    const passageCount = Number(localStorage.getItem("passageCount") ?? '0');

    const newPhonePassage = passageCount % 3 === 0;

    story.insertAdjacentHTML('afterbegin', `
        <div id="sidebar-options" style="display: flex; flex-direction: column; gap: 8px; top: 1vw; left: 1vw; position: fixed;">
            <div class="icon" style="height: 40px; width: 40px" onclick="toggleSidebar('bag')"><img src="../resources/images/icons/bag.svg" width: 40px; height: 40px></div>
            ${openedDict ? `<button style="width: 60px" onclick="toggleSidebar('id')">ID</button>` : ''}
            <div class="icon" style="height: 40px; width: 40px" onclick="toggleSidebar('stats')"><img src="../resources/images/icons/stats.svg" width: 40px; height: 40px></div>
            <div class="icon" style="height: 40px; width: 40px" onclick="toggleSidebar('phone')"><img src="../resources/images/icons/phone.svg" width: 40px; height: 40px></div>
        </div>
        <div id="sidebar" class="sidebar">
        </div>`);
}


function toggleSidebar(value, dictPage) {
    const sidebar = document.getElementById("sidebar")
    sidebar.classList.toggle("open");
    clearDictHistory();

    if (sidebar.classList.contains("open")) {

        switch (value) {
            case 'bag':
                buildItems();
                break;
            case 'id':
                buildDict(dictPage);
                break;
            case 'stats':
                buildStats();
                break;
            case 'phone':
                buildPhone();
            default:
                break;
        }
    }
}

function buildItems() {
    const sidebar = document.getElementById('sidebar');

    const title = `<p class="sidebar-title">ITEMS</p>`

    const items = JSON.parse(localStorage.getItem("items"))
    const countMap = items.reduce((acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
    }, {});
    const result = Object.entries(countMap).map(([item, count]) => `x${count} ${item}`);
    const itemsList = `<p>${result.join('<br>')}</p>`;

    const closeBtn = `<button onclick="toggleSidebar('bag')">Close Bag</button>`

    sidebar.innerHTML = title + itemsList + closeBtn
}

function buildStats() {
    const sidebar = document.getElementById('sidebar');

    const title = `<p class="sidebar-title">STATS: FOR TESTING PURPOSES ONLY</p>`

    const statsString = localStorage.getItem("stats")

    const stats = statsString.replaceAll(`"`, '').replaceAll('}', '').replaceAll('{', '').replaceAll(':', ': ').split(',')

    const partyStatus = localStorage.getItem("partyStatus");

    if (partyStatus && partyStatus != '') {
        stats.push(`<br>party status: ${partyStatus}`);
    }


    const statList = `<p>${stats.join('<br>')}</p>`;

    const closeBtn = `<button onclick="toggleSidebar('stats')">Close</button>`

    sidebar.innerHTML = title + statList + closeBtn
}

function buildPhone() {
    const sidebar = document.getElementById('sidebar');

    const title = `<p class="sidebar-title">PHONE</p>`

    const closeBtn = `<button onclick="toggleSidebar('phone')">Close</button>`

    sidebar.innerHTML = title + closeBtn
}

function addToDict(page) {
    if (page) {
        const dictPages = JSON.parse(localStorage.getItem("dictPages"));
        if (!dictPages) {
            localStorage.setItem("dictPages", JSON.stringify([page]));
        } else if (!dictPages.includes(page)) {
            dictPages.push(page);
            localStorage.setItem("dictPages", JSON.stringify(dictPages));
        }
    }
}

//TODO: Images for each entry

function buildDict(page) {
    const openedDict = JSON.parse(localStorage.getItem("openedDict"));
    const sidebar = document.getElementById('sidebar');
    let innerHTML = ``;

    manageDictHistory(page);
    addToDict(page);

    if (!openedDict) {
        localStorage.setItem("openedDict", true);

        const title = `<p class="sidebar-title">IDENTIFIER</p>`;
        const body = `<p>Welcome to your Identifier. Here you can compile and reference all of the mysterious and wonderful thingies you encounter on your journey.</p>`;
        const btn = `<button onclick="buildDict('${page}')">Continue</button>`;

        sidebar.innerHTML = title + body + btn;

        let sidebarOptions = document.getElementById("sidebar-options");
        sidebarOptions.innerHTML += `<button style="width: 60px" onclick="toggleSidebar('id')">ID</button>`;

        return;
    } else {
        let title = 'IDENTIFIER';

        if (page && page != '') {
            title = page.toUpperCase();
        }

        title = `<p class="sidebar-title">${title}</p>`;
        const body = `<p>${getDictEntry(page)}</p>`;

        innerHTML += title + body;
    }

    const buttons = [];

    const dictHistory = JSON.parse(localStorage.getItem("dictHistory"));


    if (dictHistory && dictHistory.filter(e => e != page).length > 0) {
        const trueHistory = dictHistory.filter(e => e != page)
        const lastPage = trueHistory[trueHistory.length - 1];
        const goBackBtn = `<button onclick="dictBack('${page}','${lastPage}')">Back to ${lastPage}</button>`
        buttons.push(goBackBtn);

    }


    if (page && page != '') {
        const homeBtn = `<button onclick="buildDictHome()">Identifier Home</button>`;
        buttons.push(homeBtn);
    }


    const closeBtn = `<button onclick="toggleSidebar()">Put Identifier Away</button>`;
    buttons.push(closeBtn);

    const buttonsHtml = `<div style="display: flex; flex-direction: column; gap: 8px;">${buttons.join('')}</div>`;
    innerHTML += buttonsHtml;

    sidebar.innerHTML = innerHTML;
}

function getDictEntry(value) {
    switch (value) {
        case 'hongatar':
            return `Hongatar are mischief incarnate. They, like nature, are neither good nor evil, not lawful nor chaotic. Sometimes they help a small child escape a cave, even though they might complain about the nuisance cuttingly, and make fun of the kid. Sometimes they will help a megalomaniac into great power by hacking their competitor's <button onclick="buildDict('hyperleaks')">Hyperleaks</button>. The reason faeries glow is because they have a pure and beautiful life force like <button onclick="buildDict('dorgang')">Dorgang</button>.`
        case 'hyperleaks':
            return `A Hyperleak is a prosumer product. Invented by Survecap, this machine is under constant corporate surveillance throughout all Leaks. If you do anything on this machine, Survecap will know for sure. Client-side scanning, baby.<br><br>That being said, this machine is SO user-friendly or 'easy-to-use'. Though, it is easy to use mostly because everyone in the Leakyverse uses Survecap interfaces and are used to their particular type of user-hostile. Organisms resist change.`
        case `dorgang`:
            return `If Dorgang were not so ethical, he might be a real sex wizard. But don't get your hopes up, this guy is GREY in many ways. He does like puns and dry humor, however. Always cleverness is Dorgang's jam. And he also knows a lot about anything weird, powerful or mystical. He's always on his enemies' asses, making sure they do not commit evil against large swatches of other people. Dorgang is not exactly what one might call 'chill' or 'bussin'. That being said, you REALLY want Dorgang on your team, no matter what.<br><br>Dorgang is a Gandalf-like parody character made up by someone at Wendall Carefare's Leaktable. If a comparative reference to Dorgang led you here, just know that Dorgang can be used as a comparative character-reference to the chracter that is being compared to Dorgang. They are Dorgang-like.`;
        case 'whatever':
            return 'Whatever can be somewhere, somehow, something. But it has not figured out where that is yet.';
        case 'squirrel':
            return 'A squirrel description.';
        default:
            const dictPages = JSON.parse(localStorage.getItem("dictPages"));
            return dictPages.map(e => `<button onclick=buildDict('${e}')>${e}</button>`).join('<br><br>')
    }
}

function buildDictHome() {
    clearDictHistory();
    const sidebar = document.getElementById('sidebar');
    const closeBtn = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
        <button onclick="toggleSidebar()">Put Identifier Away</button>
    </div>`;

    sidebar.innerHTML = getDictEntry() + closeBtn;
}

function clearDictHistory() {
    const dictHistory = JSON.parse(localStorage.getItem("dictHistory"));
    if (dictHistory) {
        localStorage.setItem("dictHistory", JSON.stringify([]));
    }
}

function dictBack(fromPage, toPage) {
    const dictHistory = JSON.parse(localStorage.getItem("dictHistory"));
    const newDictHistory = dictHistory.filter(e => e != fromPage && e != toPage);
    localStorage.setItem("dictHistory", JSON.stringify(newDictHistory));

    buildDict(toPage);
}

function manageDictHistory(page) {
    const dictHistory = JSON.parse(localStorage.getItem("dictHistory"));

    if (!dictHistory) {
        localStorage.setItem("dictHistory", JSON.stringify([page]));
    } else {
        dictHistory.push(page);
        localStorage.setItem("dictHistory", JSON.stringify(dictHistory));
    }
}

