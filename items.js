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
