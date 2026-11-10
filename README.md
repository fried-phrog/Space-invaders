# Space Invaders

A simple Space Invaders clone built for a school project that runs entirely in the browser, built with plain HTML, CSS and JavaScript on an HTML5 `<canvas>`.
Shoot down waves of aliens before they reach your ship. Every cleared wave brings a bigger one.

## Live demo

[**Play it in your browser**](https://fried-phrog.github.io/Space-invaders/).

## Features

* Classic invader gameplay: aliens march sideways and drop a row each time they hit a screen edge
* Endless levels: each wave adds more alien columns and rows (up to 6 columns and 12 rows)
* Two difficulty levels (Easy / Hard) that change alien moving speed
* Settings (keybinds, volumes, difficulty) are saved in `localStorage`

## How to play

* Each alien you hit is worth 10 points.
* The game ends when the aliens reach the your ship.
* Clear every alien to advance to a harder wave.

### Controls

|Action|Default key|
|-|-|
|Move left|`A`|
|Move right|`D`|
|Shoot|`Space`|
|Restart (on game over)|`R`|

All three gameplay keys can be changed under **settings**: click a button, then press the new key.

## Getting started

### Run locally

1. Clone the repository:

```bash
   git clone https://github.com/fried-phrog/Space-invaders.git
   cd Space-invaders
   ```

2. Open `index.html` in your browser.

Or serve it with a local web server.
> **Note:** Browsers block audio until you interact with the page, so the music may only start after your first click or key press. The Minecraftia font is loaded from [FontLibrary](https://fontlibrary.org/face/minecraftia), so an internet connection is needed for the pixel font.

## Project structure

```
Space-invaders/
├── index.html
├── style.css
├── main.js
├── Images/
└── Sounds/
```

## License

This project is licensed under the terms of the [LICENSE](LICENSE) file included in this repository.

