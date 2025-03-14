
export function increaseStat(name, amount) {
    const newStats = JSON.parse(localStorage.getItem("stats"));
    const newStatChecks = JSON.parse(localStorage.getItem("statChecks")) ?? {};

    const statCheck = newStatChecks[name] ?? [];

    if (!statCheck?.includes(window.location.href)) {
        newStats[name] += amount;
        statCheck.push(window.location.href);
        newStatChecks[name] = statCheck;
        localStorage.setItem("stats", JSON.stringify(newStats));
        localStorage.setItem("statChecks", JSON.stringify(newStatChecks));
    }
}


export function skillRoll(stat, onSuccess, onFailure) {
    const statValue = JSON.parse(localStorage.getItem("stats"))[stat];
    const successRate = 0.1 + (statValue * 0.3);
    const roll = Math.random();
    if (successRate > 1 || roll < successRate) {
        onSuccess();
    } else {
        onFailure();
    }

    //TODO: convert this to fate style, show the dice
    //e.g squirrel rolls and you roll

    //TODO: succeed with style?
    //TODO: Catastrophic failure?
}

