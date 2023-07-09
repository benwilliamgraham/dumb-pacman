"use strict";

import Map from "./map.js";
import Ghost from "./ghost.js";
import Pacman from "./pacman.js";

// Setup document
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "#000";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

// Setup canvas
const mapWidth = 37;
const mapHeight = 23;
let tileSize = 1;

function resize() {
  const aspect = mapWidth / (mapHeight + 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width / height > aspect) {
    canvas.width = height * aspect;
    canvas.height = height;
    tileSize = height / (mapHeight + 2);
  } else {
    canvas.width = width;
    canvas.height = width / aspect;
    tileSize = width / mapWidth;
  }
}
window.addEventListener("resize", resize);
resize();

const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;

const images = {
  pink: new Image(),
  red: new Image(),
  orange: new Image(),
  blue: new Image(),
  leftman: new Image(),
  rightman: new Image(),
  leftmandeath: new Image(),
  rightmandeath: new Image(),
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
  window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });
  window.addEventListener("mousedown", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    // Check if mouse is over ghost
    for (const ghost of ghosts) {
      // make hitbox bigger
      if (
        mouse.x >= (ghost.x - 0.5) * tileSize &&
        mouse.x < (ghost.x + 1.5) * tileSize &&
        mouse.y >= (ghost.y - 0.5) * tileSize &&
        mouse.y < (ghost.y + 1.5) * tileSize
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
  let numLives = 3;
  let score = 0;
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
  for (let [x, y, spritesheet, color] of [
    [15, 11, images.pink, "#E4639F88"],
    [17, 11, images.red, "#CA090988"],
    [19, 11, images.blue, "#00FFF988"],
    [21, 11, images.orange, "#FF810088"],
  ]) {
    ghosts.push(new Ghost(x, y, spritesheet, color));
  }

  // Add pacman
  const pacman = new Pacman(7, 7, images.leftman);

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
        score += 50;
      }
    }

    // Check if game is over
    if (numPellets === 0) {
      // TODO: Game over
    }

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    context.drawImage(
      background,
      0,
      0,
      map.width * tileSize,
      map.height * tileSize
    );

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
      context.drawImage(
        ghost.spritesheet,
        (ghost.spritesheet.width / ghost.numFrames) * ghost.frame,
        0,
        ghost.spritesheet.width / ghost.numFrames,
        ghost.spritesheet.height,
        ghost.x * tileSize,
        ghost.y * tileSize,
        tileSize,
        tileSize
      );
    }

    // Draw pacman reversed if moving left
    if (pacman.direction === "left") {
      pacman.spritesheet = images.leftman;
    } else {
      pacman.spritesheet = images.rightman;
    }

    context.drawImage(
      pacman.spritesheet,
      (pacman.spritesheet.width / pacman.numFrames) * pacman.frame,
      0,
      pacman.spritesheet.width / pacman.numFrames,
      pacman.spritesheet.height,
      pacman.x * tileSize,
      pacman.y * tileSize - tileSize / 6,
      tileSize,
      tileSize + tileSize / 6
    );

    // Draw path
    if (ghostSelected !== null) {
      const ghostPath = map.getPath(
        ghostSelected.prevX,
        ghostSelected.prevY,
        Math.floor(mouse.x / tileSize),
        Math.floor(mouse.y / tileSize)
      );
      context.strokeStyle = ghostSelected.color;
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

    // Draw lives
    context.drawImage(
      images.rightman,
      (2 * images.rightman.width) / pacman.numFrames,
      0,
      images.rightman.width / pacman.numFrames,
      images.rightman.height,
      tileSize * 2,
      (mapHeight + 0.25) * tileSize,
      ((tileSize * 1.5) / 12) * 9,
      tileSize * 1.5
    );
    context.fillStyle = "#FFFF00";
    context.font = "bold " + tileSize + "px monospace";
    context.fillText(
      "x " + numLives,
      tileSize * 3.5,
      mapHeight * tileSize + tileSize * 1.5
    );

    // Draw score
    context.fillText(
      "Score: " + String(score).padStart(6, "0"),
      tileSize * map.width - tileSize * 10,
      mapHeight * tileSize + tileSize * 1.5
    );

    requestAnimationFrame(gameLoop);
  }
  requestAnimationFrame(gameLoop);
}
