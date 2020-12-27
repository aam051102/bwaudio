class BWAudio {
    constructor(url, volume, looping) {
        this.url = url;
        this.volume = volume || 1;
        this.looping = looping || false;
        this.isPlaying = false;
        this.isPaused = false;
        this.isWebAudio;
        this.source;

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
    }

    initWebAudio() {
        this.aCtx;
        if (window.webkitAudioContext) {
            this.aCtx = new window.webkitAudioContext();
        } else {
            this.aCtx = new window.AudioContext();
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
                })
                .catch((err) => {
                    console.error(err);
                });
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
                    },
                    (err) => {
                        console.error(err);
                    }
                );
            });

            xhr.addEventListener("error", (err) => {
                console.error(err);
            });

            xhr.send();
        }
    }

    setVolume(volume) {
        if (this.isWebAudio) {
            this.gainNode.gain.value = this.volume = volume;
        } else {
            this.source.volume = this.volume = volume;
        }
    }

    start() {
        if (!this.isPlaying) {
            if (this.isWebAudio) {
                this.source.start(0);
            } else {
                this.source.play();
            }

            this.isPlaying = true;
            this.isPaused = false;
        }
    }

    stop() {
        if (this.isPlaying) {
            if (this.isWebAudio) {
                this.source.stop(0);
                this.source = this.aCtx.createBufferSource();
                this.source.buffer = this.buffer;
                this.source.connect(this.gainNode);
                this.source.loop = this.looping;
            } else {
                this.source.pause();
            }

            this.isPlaying = false;
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
