const activeAudios = [];
let audio;
let audioPath;

export function playAudio(audioUrl, loop, fadeDuration, buffer) {


    if (audioUrl != audioPath) {
        audio = new Audio(audioUrl);
        audio.preload = "auto";
        audioPath = audioUrl;

        if (loop) {
            audio.addEventListener("loadedmetadata", function () {

                const duration = audio.duration;
                console.log(duration);
                setInterval(() => {
                    console.log('play it again');
                    audio.currentTime = 0;
                    console.log('played!');
                }, duration * 1000);

            });
        }

        if (buffer) {
            audio.addEventListener('timeupdate', function () {
                if (this.currentTime > this.duration - buffer) {
                    this.currentTime = 0
                    this.play();
                }
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

export function stopAudio() {
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

        audio = null;
    }
}

export function checkAudio() {
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

export function saveAudioState() {
    if (audio) {
        sessionStorage.setItem("audioTime", audio.currentTime);
        sessionStorage.setItem("audioPath", audioPath);
    }
}


