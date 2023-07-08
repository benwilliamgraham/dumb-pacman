"use strict";

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

  function gameLoop(time) {
    const path = map.getPath(
      0,
      0,
      Math.floor(mouse.x / tileSize),
      Math.floor(mouse.y / tileSize)
    );

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
      }
    }

    // Draw path
    if (path !== null) {
      context.strokeStyle = "rgba(0, 0, 0, 0.5)";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(
        path[0][0] * tileSize + tileSize / 2,
        path[0][1] * tileSize + tileSize / 2
      );
      for (let i = 1; i < path.length; i++) {
        // Determine if the path has wrapped around the map
        const xDiff = Math.abs(path[i][0] - path[i - 1][0]);
        const yDiff = Math.abs(path[i][1] - path[i - 1][1]);
        if (xDiff > 1 || yDiff > 1) {
          context.stroke();
          context.beginPath();
          context.moveTo(
            path[i][0] * tileSize + tileSize / 2,
            path[i][1] * tileSize + tileSize / 2
          );
        }
        context.lineTo(
          path[i][0] * tileSize + tileSize / 2,
          path[i][1] * tileSize + tileSize / 2
        );
      }
      context.stroke();
    }

    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);
}

play();
