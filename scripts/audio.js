const activeAudios = [];
let audio;
let audioPath;
let intervalId;
let intervalTime = 0;

function updateInterval() {
    clearInterval(intervalId);
    intervalTime = audio.duration - audio.currentTime;
    intervalId = setInterval(() => {
        audio.currentTime = 0;
        updateInterval();
    }, intervalTime * 1000);
}

export function playAudio(audioUrl, loop, fadeDuration) {

    if (audioUrl != audioPath) {
        audio = new Audio(audioUrl);
        audioPath = audioUrl;

        if (loop) {
            audio.addEventListener("loadedmetadata", function () {
                updateInterval();
            });
        }

        if (fadeDuration) {
            audio.volume = 0;
            var isFirstIteration = true;
            function fadeInVolume() {
                if (isFirstIteration) {
                    var interval = 50;
                    var step = (1 / fadeDuration) * (interval / 1000);
                    var currentVolume = audio.volume;

                    var fadeInterval = setInterval(function () {
                        if (currentVolume < 1) {
                            currentVolume += step;
                            if (audio) {
                                audio.volume = Math.min(currentVolume, 1);
                            }
                        } else {
                            clearInterval(fadeInterval);
                            isFirstIteration = false;
                        }
                    }, interval);
                }
            }
            audio.addEventListener('play', fadeInVolume);
            audio.play();
        } else {
            audio.play();
        }

        activeAudios.push({
            audioUrl: audioUrl,
            audio: audio,
        });
    }
}

export function stopAudio() {
    if (audio) {
        audio.currentTime = 0;
        audio.volume = 0;
        audio.pause();
    }
    sessionStorage.setItem("audioPath", null);
}

export function checkAudio() {
    const url = window.location.href;
    const savedAudio = sessionStorage.getItem("audioPath")

    const resumeAudio = (savedAudio?.includes('faeries') && url.includes('faeries')) ||
        (savedAudio?.includes('party') && url.includes('party')) ||
        (savedAudio?.includes('hypno') && url.includes('hypno')) ||
        (savedAudio?.includes('park') && url.includes('park')) ||
        (savedAudio?.includes('neighborhood') && url.includes('neighborhood'))

    if (resumeAudio) {
        playAudio(savedAudio, true, null);
        const savedTime = sessionStorage.getItem("audioTime");
        audio.currentTime = parseFloat(savedTime);
    }
}

export function saveAudioState() {
    if (audio) {
        sessionStorage.setItem("audioTime", audio.currentTime);
        sessionStorage.setItem("audioPath", audioPath);
    }
}