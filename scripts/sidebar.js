import { BAG_ICON, STATS_ICON, PHONE_ICON, ID_ICON } from "./icons.js";
import { dismissPhoneAlert } from "./alerts.js";


export function buildSidebar() {
    const story = document.getElementById('story');
    const openedDict = JSON.parse(localStorage.getItem("openedDict"));

    const sidebarOptions = document.getElementById("sidebar-options");

    const phoneItems = JSON.parse(localStorage.getItem('phoneItems'));
    const unreadPhoneItems = phoneItems.filter(e => !e.isRead);

    const innerHTML = `
    <div class="icon" onclick="toggleSidebar('bag', null, event)">${BAG_ICON}</div>
        <div class="icon" onclick="toggleSidebar('stats', null, event)">${STATS_ICON}</div>
        <div class="icon-container">
        <div class="icon" onclick="toggleSidebar('phone', null, event)">
            ${PHONE_ICON}
        </div>
        ${openedDict ? `<div class="icon" onclick="toggleSidebar('id', null, event)">${ID_ICON}</div>` : ''}
        ${unreadPhoneItems.length > 0 ? `<div class="notification-badge"><p>${unreadPhoneItems.length}</p></div>` : ''}
    </div>`




    if (sidebarOptions) {
        sidebarOptions.innerHTML = innerHTML
    } else {
        story.insertAdjacentHTML('afterbegin', `
            <div id="sidebar-options" style="display: flex; flex-direction: column; gap: 8px; top: 1vw; left: 1vw; position: fixed;">
            ${innerHTML}
            </div>
            <div id="sidebar" class="sidebar">
            </div>`);
    }
}

export function toggleSidebar(value, dictPage, event) {
    event.stopPropagation();
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

    const clearButton = `<button onclick="clearItems()">Empty Bag</button>`

    const closeBtn = `<button onclick="toggleSidebar('bag', null, event)">Close Bag</button>`

    sidebar.innerHTML = title + itemsList + clearButton + closeBtn
}

function clearItems() {
    localStorage.setItem('items', '[]');
}
window.clearItems = clearItems;


function buildStats() {
    const sidebar = document.getElementById('sidebar');

    const title = `<p class="sidebar-title">STATS</p>`

    const statsString = localStorage.getItem("stats")

    const stats = statsString.replaceAll(`"`, '').replaceAll('}', '').replaceAll('{', '').replaceAll(':', ': ').split(',')

    const aspect = localStorage.getItem("aspect");

    const statList = `<p>${stats.map((stat) => {
        return `<div style="width: 340px; display: flex; flex-direction: row;"><span style="flex: 1">${stat.split(':')[0]}:</span><span style="flex: 1">${stat.split(':')[1]}</span></div>`
    }).join('<br>')}</p>`

    const closeBtn = `<button onclick="toggleSidebar('stats', null, event)">Close</button>`

    sidebar.innerHTML = title + statList + `<p>aspect: ${aspect}</p><br>` + closeBtn
}

function buildPhone() {
    dismissPhoneAlert();
    const phoneItems = JSON.parse(localStorage.getItem('phoneItems'))
    const newPhoneItems = phoneItems.map(e => ({
        id: e.id,
        content: e.content,
        isRead: true,
    }));
    localStorage.setItem('phoneItems', JSON.stringify(newPhoneItems))

    const body = phoneItems.map(e => e.content).join('<br>');

    const sidebar = document.getElementById('sidebar');

    const title = `<p class="sidebar-title">PHONE</p>`


    const closeBtn = `<button onclick="toggleSidebar('phone', null, event); buildSidebar();">Close</button>`

    sidebar.innerHTML = title + body + closeBtn
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
        sidebarOptions.innerHTML += `<div class="icon" onclick="toggleSidebar('id', null, event)">${ID_ICON}</div>`;

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


    const closeBtn = `<button onclick="toggleSidebar(null, null, event)">Put Identifier Away</button>`;
    buttons.push(closeBtn);

    const buttonsHtml = `<div style="display: flex; flex-direction: column; gap: 8px;">${buttons.join('')}</div>`;
    innerHTML += '<br>' + buttonsHtml;

    sidebar.innerHTML = innerHTML;
}
window.buildDict = buildDict;

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
            dictPages.sort((a, b) => a.localeCompare(b))
            return dictPages.map(e => `<button onclick=buildDict('${e}')>${e}</button>`).join('<br><br>')
    }
}

function buildDictHome() {
    clearDictHistory();
    const sidebar = document.getElementById('sidebar');
    const closeBtn = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
        <button onclick="toggleSidebar(null, null, event)">Put Identifier Away</button>
    </div>`;

    sidebar.innerHTML = getDictEntry() + closeBtn;
}
window.buildDictHome = buildDictHome;

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
window.dictBack = dictBack;

function manageDictHistory(page) {
    const dictHistory = JSON.parse(localStorage.getItem("dictHistory"));

    if (!dictHistory) {
        localStorage.setItem("dictHistory", JSON.stringify([page]));
    } else {
        dictHistory.push(page);
        localStorage.setItem("dictHistory", JSON.stringify(dictHistory));
    }
}
