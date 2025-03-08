export function addItem(name) {
    //TODO: add item sound
    const newItems = JSON.parse(localStorage.getItem("items"));
    newItems.push(name);
    localStorage.setItem("items", JSON.stringify(newItems));

    const elements = [...document.querySelectorAll("*")].filter(el =>
        el.getAttribute("onclick")?.includes(`addItem('${name}')`)
    );

    elements.forEach(e => {
        e.style.display = 'none';
    })

    showSnackbar(`You got +1 <strong>${name}</strong>`)
}

function checkSinkStatus() {
    if (sinkPassages.some(e => window.location.href.includes(e))) {
        const itemCount = JSON.parse(localStorage.getItem('items')).length;

        console.log(itemCount)

        let sinkingText = ''

        switch (itemCount) {
            case 1:
                sinkingText = 'You feel your feet sinking into the pine needles ever so slightly.^^'
                break;
            case 2:
                sinkingText = 'The pine needles are up to your ankles, making your progress moderately difficult.^^'
                break;
            case 3:
                sinkingText = `The weight of your bag is making it difficult to walk. Your feet are sinking deep into the pine needles.^^`
                break;
        }

        return sinkingText;
    }

    return null;
}

export function removeItem(name, overrideId) {
    const newItems = JSON.parse(localStorage.getItem("items"));

    const index = newItems.indexOf(name);
    if (index !== -1) {
        newItems.splice(index, 1);
        localStorage.setItem("items", JSON.stringify(newItems));
    }

    showSnackbar(`-1 <strong>${name}</strong>`)
}

export function checkItems(value) {
    const newItems = JSON.parse(localStorage.getItem("items"));
    return !newItems.includes(value);
}
