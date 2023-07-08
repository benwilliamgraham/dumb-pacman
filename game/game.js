"use strict";

import Map from "./map.js";
import Ghost from "./ghost.js";
import Pacman from "./pacman.js";

// Setup document
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

// Setup canvas
const mapWidth = 37;
const mapHeight = 23;
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

const images = {
  pacman: new Image(),
};
const background = new Image();
background.src = "assets/textures/level 1.png";
background.onload = () => {
  play();
};

function loadImages() {
  for (const key in images) {
    images[key].src = `assets/textures/${key}.png`;
  }
}

class Tile {
  constructor(solid, hasPellet = false) {
    this.solid = solid;
    this.hasPellet = hasPellet;
  }
}

function play() {
  // Load images
  loadImages();

  // Setup controls
  const mouse = {
    x: 0,
    y: 0,
  };
  let ghostSelected = null;
  let ghostPath = null;
  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    // Update ghost path
    if (ghostSelected !== null) {
      ghostPath = map.getPath(
        ghostSelected.prevX,
        ghostSelected.prevY,
        Math.floor(mouse.x / tileSize),
        Math.floor(mouse.y / tileSize)
      );
    }
  });
  window.addEventListener("mousedown", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    // Check if mouse is over ghost
    for (const ghost of ghosts) {
      if (
        mouse.x >= ghost.x * tileSize &&
        mouse.x < (ghost.x + 1) * tileSize &&
        mouse.y >= ghost.y * tileSize &&
        mouse.y < (ghost.y + 1) * tileSize
      ) {
        ghostSelected = ghost;
      }
    }
  });
  window.addEventListener("mouseup", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    // Update ghost path
    if (ghostSelected !== null) {
      ghostSelected.setPath(
        Math.floor(mouse.x / tileSize),
        Math.floor(mouse.y / tileSize)
      );
      ghostSelected = null;
      ghostPath = null;
    }
  });

  // Sample background image
  const backgroundCanvas = document.createElement("canvas");
  backgroundCanvas.width = background.width;
  backgroundCanvas.height = background.height;
  const backgroundContext = backgroundCanvas.getContext("2d");
  backgroundContext.drawImage(background, 0, 0);

  // Create map
  let numPellets = 0;
  const map = new Map(mapWidth, mapHeight);
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      // Sample background image
      const imgX = Math.floor(((x + 0.5) / mapWidth) * background.width);
      const imgY = Math.floor(((y + 0.5) / mapHeight) * background.height);
      const pixel = backgroundContext.getImageData(imgX, imgY, 1, 1).data;

      if (pixel[1] == 0) {
        if (x > 0 && x < mapWidth - 1 && y > 0 && y < mapHeight - 1) {
          numPellets++;
          map.tiles.set(x, y, new Tile(false, true));
        } else {
          map.tiles.set(x, y, new Tile(false));
        }
      } else {
        map.tiles.set(x, y, new Tile(true));
      }
    }
  }

  // Add ghosts
  const ghosts = [];
  for (let i = 0; i < 4; i++) {
    ghosts.push(new Ghost(15 + i * 2, 11));
  }

  // Add pacman
  const pacman = new Pacman(7, 7);

  let lastTime = 0;
  function gameLoop(time) {
    const dt = (time - lastTime) % 1000; // Prevents delta time from getting too large
    lastTime = time;

    // Update ghosts
    for (const ghost of ghosts) {
      ghost.update(map, dt);
    }

    // Update pacman
    pacman.update(map, dt, ghosts);

    // Update pellets
    for (let [x, y] of [[pacman.prevX, pacman.prevY]]) {
      if (map.tiles.get(x, y).hasPellet) {
        map.tiles.get(x, y).hasPellet = false;
        numPellets--;
      }
    }

    // Check if game is over
    if (numPellets === 0) {
      // TODO: Game over
    }

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Draw pellets
    context.fillStyle = "rgba(255, 255, 255, 1.0)";
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (map.tiles.get(x, y).hasPellet) {
          context.beginPath();
          context.fillRect(
            x * tileSize + tileSize / 2 - tileSize / 8,
            y * tileSize + tileSize / 2 - tileSize / 8,
            tileSize / 4,
            tileSize / 4
          );
          context.fill();
        }
      }
    }

    // Draw ghosts
    for (const ghost of ghosts) {
      context.fillStyle = "rgba(255, 0, 0, 0.5)";
      context.fillRect(
        ghost.x * tileSize,
        ghost.y * tileSize,
        tileSize,
        tileSize
      );
    }

    // Draw pacman
    context.fillStyle = "rgba(255, 255, 0, 0.5)";
    context.fillRect(
      pacman.x * tileSize,
      pacman.y * tileSize,
      tileSize,
      tileSize
    );

    // Draw path
    if (ghostPath !== null) {
      context.strokeStyle = "rgba(255, 0, 0, 0.5)";
      context.lineWidth = tileSize / 4;
      context.beginPath();
      context.moveTo(
        ghostSelected.x * tileSize + tileSize / 2,
        ghostSelected.y * tileSize + tileSize / 2
      );
      context.lineTo(
        ghostPath[0][0] * tileSize + tileSize / 2,
        ghostPath[0][1] * tileSize + tileSize / 2
      );
      for (let i = 1; i < ghostPath.length; i++) {
        // Determine if the ghostPath has wrapped around the map
        const xDiff = Math.abs(ghostPath[i][0] - ghostPath[i - 1][0]);
        const yDiff = Math.abs(ghostPath[i][1] - ghostPath[i - 1][1]);
        if (xDiff > 1 || yDiff > 1) {
          context.stroke();
          context.beginPath();
          context.moveTo(
            ghostPath[i][0] * tileSize + tileSize / 2,
            ghostPath[i][1] * tileSize + tileSize / 2
          );
        }
        context.lineTo(
          ghostPath[i][0] * tileSize + tileSize / 2,
          ghostPath[i][1] * tileSize + tileSize / 2
        );
      }
      context.stroke();
    }

    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);
}
