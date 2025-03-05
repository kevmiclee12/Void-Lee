const activeAudios = [];
let audio;
let audioPath;

export function playAudio(audioUrl, loop, fadeDuration) {

    console.log(`playing: ${audioUrl}`)

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
            audio.play();

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
    console.log(`stopping: ${audio}`);
    if (audio) {
        const fadeDuration = 1000;
        const interval = 50;
        const fadeStep = audio.volume / (fadeDuration / interval);

        console.log(`volume: ${audio.volume}`);
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

export function checkAudio() {
    const url = window.location.href;
    const savedAudio = sessionStorage.getItem("audioPath")

    console.log('CHECKING: ', savedAudio)

    if (savedAudio) {
        if (url.includes('faeries')) {
            playAudio(savedAudio, false, false);
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