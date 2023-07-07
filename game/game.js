"use strict";

import Array2D from "./array2d.js";
import Guard from "./guard.js";
import Map from "./map.js";

// Setup document
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

// Setup canvas
const mapWidth = 40;
const mapHeight = 30;
let tileSize = 1;

function resize() {
  const aspect = mapWidth / mapHeight;
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width / height > aspect) {
    canvas.width = height * aspect;
    canvas.height = height;
    tileSize = height / mapHeight;
  } else {
    canvas.width = width;
    canvas.height = width / aspect;
    tileSize = width / mapWidth;
  }
}
window.addEventListener("resize", resize);
resize();

const context = canvas.getContext("2d");

// Add mouse position tracking
const mouse = {
  x: 0,
  y: 0,
};
window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

const images = {
  demo: new Image(),
  guard: new Image(),
};

function loadImages() {
  for (const key in images) {
    images[key].src = `assets/textures/${key}.png`;
  }
}

class Tile {
  constructor(solid, texture) {
    this.solid = solid;
    this.texture = texture;
  }
}

function play() {
  loadImages();

  // Create map
  const map = new Map(mapWidth, mapHeight);
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      if (Math.random() < 0.1) {
        map.tiles.set(x, y, new Tile(true, "demo"));
      } else {
        map.tiles.set(x, y, new Tile(false, null));
      }
    }
  }

  // Create guards
  const guards = [];
  for (let i = 0; i < 10; i++) {
    guards.push(
      new Guard(
        Math.floor(Math.random() * mapWidth),
        Math.floor(Math.random() * mapHeight),
        Math.floor(Math.random() * 4) * 90
      )
    );
  }

  function draw(time) {
    // Update guards and compute visibility
    map.visibility.fill(false);
    for (const guard of guards) {
      guard.update(map);
    }

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tile = map.tiles.get(x, y);
        if (tile.texture) {
          context.drawImage(
            images[tile.texture],
            x * tileSize,
            y * tileSize,
            tileSize,
            tileSize
          );
        }
        // Cover with gray if not visible
        if (!map.visibility.get(x, y)) {
          context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }

    // Draw guards
    for (const guard of guards) {
      context.drawImage(
        images.guard,
        guard.x * tileSize,
        guard.y * tileSize,
        tileSize,
        tileSize
      );
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

play();
