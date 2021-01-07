class BWAudio {
    constructor(url, volume, looping, next) {
        this.url = url;
        this.volume = volume || 1;
        this.looping = looping || false;
        this.isPlaying = false;
        this.isPaused = false;
        this.isWebAudio;
        this.source;
        this.next = next ? new BWAudio(next, volume, true) : undefined;
        this.isPlayingNext = false;

        this.onerror = (e) => {
            console.error(e);
        };

        this.oncanplay = () => {};

        this.onended = () => {
            if (this.next && !this.isPlayingNext && this.isPlaying) {
                this.next.start();
                this.isPlayingNext = true;
            }
        };

        if (window.AudioContext || window.webkitAudioContext) {
            this.initWebAudio();
            this.isWebAudio = true;
        } else {
            this.initFallbackAudio();
            this.isWebAudio = false;
        }
    }

    initFallbackAudio() {
        this.source = new Audio(this.url);
        this.source.volume = this.volume;
        this.source.loop = this.looping;
        this.source.oncanplay = this.oncanplay;
        this.source.onended = this.onended;
    }

    initWebAudio() {
        this.aCtx;
        if (window.webkitAudioContext) {
            this.aCtx = new window.webkitAudioContext();
        } else {
            this.aCtx = new window.AudioContext();
        }

        if (this.aCtx.state != "running") {
            this.pageInteraction = document.addEventListener("click", () => {
                this.aCtx.resume().then(() => {
                    document.removeEventListener("click", this.pageInteraction);
                });
            });
        }

        this.source = this.aCtx.createBufferSource();
        this.buffer;
        this.gainNode = this.aCtx.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.aCtx.destination);

        if (window.fetch) {
            fetch(this.url)
                .then((resp) => resp.arrayBuffer())
                .then((buf) => this.aCtx.decodeAudioData(buf))
                .then((decoded) => {
                    this.source.buffer = this.buffer = decoded;
                    this.source.loop = this.looping;
                    this.source.connect(this.gainNode);
                    this.source.onended = this.onended;
                    this.oncanplay();
                })
                .catch(onerror);
        } else {
            let xhr = new XMLHttpRequest();

            xhr.open("GET", this.url);
            xhr.responseType = "arraybuffer";

            xhr.addEventListener("load", (res) => {
                this.aCtx.decodeAudioData(
                    xhr.response,
                    (decoded) => {
                        this.source.buffer = this.buffer = decoded;
                        this.source.loop = this.looping;
                        this.source.connect(this.gainNode);
                        this.source.onended = this.onended;
                        this.oncanplay();
                    },
                    this.onerror
                );
            });

            xhr.addEventListener("error", this.onerror);

            xhr.send();
        }
    }

    setVolume(volume) {
        if (this.isWebAudio) {
            this.gainNode.gain.value = this.volume = volume;
        } else {
            this.source.volume = this.volume = volume;
        }

        if (this.next) {
            this.next.setVolume(this.volume);
        }
    }

    start() {
        if (!this.isPlaying) {
            if (this.isWebAudio) {
                if (this.aCtx.state == "running") {
                    this.source.start(0);
                } else {
                    return;
                }
            } else {
                this.source.play();
            }

            this.isPlaying = true;
            this.isPaused = false;
        }
    }

    stop() {
        if (this.isPlaying) {
            this.isPlaying = false;

            if (this.isWebAudio) {
                this.source.stop(0);
                this.source = this.aCtx.createBufferSource();
                this.source.buffer = this.buffer;
                this.source.connect(this.gainNode);
                this.source.loop = this.looping;
                this.source.onended = this.onended;
            } else {
                this.source.pause();
            }

            if (this.isPlayingNext) {
                this.next.stop();
                this.isPlayingNext = false;
            }
        }
    }

    pause() {
        if (this.isPlaying && !this.isPaused) {
            if (this.isWebAudio) {
                this.aCtx.suspend().then(() => {
                    this.isPaused = true;
                });
            } else {
                this.source.pause();
                this.isPaused = true;
            }
        }
    }

    resume() {
        if (this.isPlaying && this.isPaused) {
            if (this.isWebAudio) {
                this.aCtx.resume().then(() => {
                    this.isPaused = false;
                });
            } else {
                this.source.play();
                this.isPaused = false;
            }
        }
    }
}
