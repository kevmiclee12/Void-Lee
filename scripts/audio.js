const activeAudios = [];
let audio;
let audioPath;

export function playAudio(audioUrl, loop, fadeDuration) {

    if (audioUrl != audioPath) {
        audio = new Audio(audioUrl);
        audioPath = audioUrl;

        if (loop) {
            audio.addEventListener("loadedmetadata", function () {
                const duration = audio.duration;
                setInterval(() => {
                    audio.currentTime = 0;
                }, duration * 1000);
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

    if (savedAudio) {
        if (url.includes('faeries')) {
            playAudio(savedAudio, false, null);
            const savedTime = sessionStorage.getItem("audioTime");
            audio.currentTime = parseFloat(savedTime);
        }
    }
}

export function saveAudioState() {
    if (audio) {
        sessionStorage.setItem("audioTime", audio.currentTime);
        sessionStorage.setItem("audioPath", audioPath);
    }
}