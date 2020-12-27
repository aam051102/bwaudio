# Better Web Audio

A simple class which uses the Web Audio system for perfect loading and looping. Has fallbacks for fetch (to XHR) and Web Audio API (to Audio class).

I made this because I was asked how to loop audio without a pause and I got annoyed at having to handle all of the different systems that come with the Web Audio API.

Use it however you see fit.

## Usage

### Start

```js
const audio = new WBAudio("path/to/audio.mp3", 1, true); // URL, volume, looping
audio.start();
```

### Stop

```js
audio.stop();
```

### Pause

```js
audio.pause();
```

### Resume

```js
audio.resume();
```

## License

MIT
