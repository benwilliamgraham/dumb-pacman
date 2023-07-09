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

let context = null;

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

  context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
}
window.addEventListener("resize", resize);
resize();

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
let level = 1;
background.src = "assets/textures/level1.png";

function loadImages() {
  for (const key in images) {
    images[key].src = `assets/textures/${key}.png`;
  }
}
loadImages();

const sounds = {
  death: new Audio("assets/audio/death.mp3"),
  collect: new Audio("assets/audio/collect.mp3"),
  ambient: new Audio("assets/audio/ambient.mp3"),
  progress: new Audio("assets/audio/progress.mp3"),
};
sounds.collect.volume = 0.4;

sounds.ambient.loop = true;
sounds.ambient.volume = 0.2;

class Tile {
  constructor(solid, hasPellet = false) {
    this.solid = solid;
    this.hasPellet = hasPellet;
  }
}

function play() {
  sounds.ambient.play();

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

  // Create map
  let numPellets = 0;
  let numLives = 5;
  let score = 0;
  let gameMode = "loading";
  const map = new Map(mapWidth, mapHeight);
  let pacman = null;
  let ghosts = null;

  function createEntities() {
    // Add ghosts
    const ghosts = [];
    for (let [x, y, spritesheet, color] of [
      [15, 11, images.pink, "#E4639F88"],
      [17, 11, images.red, "#CA090988"],
      [19, 11, images.blue, "#00FFF988"],
      [21, 11, images.orange, "#FF810088"],
    ]) {
      ghosts.push(new Ghost(x, [y, y, y + 1][level - 1], spritesheet, color));
    }

    // Add pacman
    const pacman = new Pacman([7, 6, 5][level - 1], 7, images.leftman);

    return [pacman, ghosts];
  }

  function initMap() {
    background.onload = () => {
      // Sample background image
      const backgroundCanvas = document.createElement("canvas");
      backgroundCanvas.width = background.width;
      backgroundCanvas.height = background.height;
      const backgroundContext = backgroundCanvas.getContext("2d");
      backgroundContext.drawImage(background, 0, 0);

      for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
          // Sample background image
          const imgX = Math.floor(((x + 0.5) / mapWidth) * background.width);
          const imgY = Math.floor(((y + 0.5) / mapHeight) * background.height);
          const pixel = backgroundContext.getImageData(imgX, imgY, 1, 1).data;

          if (pixel[0] == 0 && pixel[1] == 0 && pixel[2] == 0) {
            numPellets++;
            map.tiles.set(x, y, new Tile(false, true));
          } else {
            map.tiles.set(x, y, new Tile(true));
          }
        }
      }

      // Create entities
      [pacman, ghosts] = createEntities();

      // Start game
      gameMode = "playing";
    };
    background.src = `assets/textures/level${level}.png`;
  }
  initMap();

  let lastTime = 0;
  function gameLoop(time) {
    const dt = (time - lastTime) % 1000; // Prevents delta time from getting too large
    lastTime = time;

    if (gameMode === "playing") {
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
          sounds.collect.play();
          score += 50;
        }
      }

      // Check if game is over
      if (numPellets === 0) {
        sounds.progress.play();
        level = (level % 3) + 1;
        gameMode = "loading";

        // Wait 3 seconds before loading next level
        setTimeout(() => {
          initMap();
        }, 3000);
      }

      // Check if pacman is hit
      for (const ghost of ghosts) {
        if (
          Math.abs(pacman.x - ghost.x) < 0.5 &&
          Math.abs(pacman.y - ghost.y) < 0.5
        ) {
          numLives--;
          sounds.death.play();

          // Change game mode
          gameMode = "respawning";

          // Change to death animation
          if (pacman.direction === "left") {
            pacman.spritesheet = images.leftmandeath;
          } else {
            pacman.spritesheet = images.rightmandeath;
          }
          pacman.numFrames = 12;
          pacman.framesPerSecond = 5;

          // Reset ghost path
          for (const ghost of ghosts) {
            ghost.path = null;
          }

          // Wait 2 seconds
          setTimeout(() => {
            if (numLives === 0) {
              gameMode = "gameover";
              titleScreen();
              return;
            }
            gameMode = "playing";

            // Reset entities
            [pacman, ghosts] = createEntities();
          }, 1700);
        }
      }
    }

    if (gameMode !== "loading") {
      // Animate sprites
      pacman.animate(dt);
      for (const ghost of ghosts) {
        ghost.animate(dt);
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
      if (gameMode === "playing") {
        pacman.numFrames = 4;
        pacman.framesPerSecond = 10;
        if (pacman.direction === "left") {
          pacman.spritesheet = images.leftman;
        } else {
          pacman.spritesheet = images.rightman;
        }
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
        (2 * images.rightman.width) / 4,
        0,
        images.rightman.width / 4,
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
    }

    if (gameMode !== "gameover") {
      requestAnimationFrame(gameLoop);
    }
  }
  requestAnimationFrame(gameLoop);
}

function howToPlay() {
  // Create title screen overtop of canvas
  const howToScreen = document.createElement("div");
  howToScreen.style.position = "absolute";
  howToScreen.style.top = "0";
  howToScreen.style.left = "0";
  howToScreen.style.width = "100%";
  howToScreen.style.height = "100%";
  howToScreen.style.backgroundColor = "black";
  howToScreen.style.zIndex = "1";
  howToScreen.style.display = "flex";
  howToScreen.style.flexDirection = "column";
  howToScreen.style.justifyContent = "center";
  howToScreen.style.alignItems = "center";
  howToScreen.style.color = "yellow";
  howToScreen.style.textShadow =
    "-2px -2px 0 #00F, 2px -2px 0 #00F, -2px 2px 0 #00F, 2px 2px 0 #00F";
  howToScreen.style.fontFamily = "Silkscreen, cursive";
  howToScreen.style.fontSize = "1.5em";
  howToScreen.style.textAlign = "center";
  document.body.appendChild(howToScreen);

  for (let text of [
    "After hitting his head, Pacman is confused and thinks that he needs to go and touch the ghosts to win.",
    "In this game you get to control the ghosts, and you need to lead pacman around the different maps having him eat the pellets.",
    "You control the ghosts by dragging out a route for them to follow.",
  ]) {
    const p = document.createElement("p");
    p.innerText = text;
    howToScreen.appendChild(p);
  }

  // Add instructional gif
  const gif = document.createElement("img");
  gif.src = "assets/textures/howto.gif";
  gif.style.width = "50%";
  gif.style.height = "auto";
  gif.style.marginTop = "20px";
  howToScreen.appendChild(gif);

  // Add start button
  const startButton = document.createElement("div");
  startButton.textContent = "Start";
  startButton.style.backgroundColor = "#EE8321";
  startButton.style.borderRadius = "10px";
  startButton.style.padding = "10px";
  startButton.style.marginTop = "20px";
  startButton.style.cursor = "pointer";
  startButton.style.color = "#FBCF07";
  startButton.style.textShadow =
    "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000";
  startButton.onmouseover = () => {
    startButton.style.backgroundColor = "#DD7311";
  };
  startButton.onmouseout = () => {
    startButton.style.backgroundColor = "#EE8321";
  };
  startButton.onclick = () => {
    howToScreen.remove();
    play();
  };
  howToScreen.appendChild(startButton);
}

function titleScreen() {
  // Create title screen overtop of canvas
  const titleScreen = document.createElement("div");
  titleScreen.style.position = "absolute";
  titleScreen.style.top = "0";
  titleScreen.style.left = "0";
  titleScreen.style.width = "100%";
  titleScreen.style.height = "100%";
  titleScreen.style.backgroundColor = "black";
  titleScreen.style.zIndex = "1";
  titleScreen.style.display = "flex";
  titleScreen.style.flexDirection = "column";
  titleScreen.style.justifyContent = "center";
  titleScreen.style.alignItems = "center";
  titleScreen.style.color = "white";
  titleScreen.style.fontFamily = "Silkscreen, cursive";
  titleScreen.style.fontSize = "2em";
  titleScreen.style.textAlign = "center";
  document.body.appendChild(titleScreen);

  // Add title image
  const titleImage = document.createElement("img");
  titleImage.src = "assets/textures/logo.png";
  titleImage.style.width = "100%";
  titleImage.style.maxWidth = "600px";
  titleScreen.appendChild(titleImage);

  // Add start button
  const startButton = document.createElement("div");
  startButton.textContent = "Start";
  startButton.style.backgroundColor = "#EE8321";
  startButton.style.borderRadius = "10px";
  startButton.style.padding = "10px";
  startButton.style.marginTop = "20px";
  startButton.style.cursor = "pointer";
  startButton.style.color = "#FBCF07";
  startButton.style.textShadow =
    "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000";
  startButton.onmouseover = () => {
    startButton.style.backgroundColor = "#DD7311";
  };
  startButton.onmouseout = () => {
    startButton.style.backgroundColor = "#EE8321";
  };
  startButton.onclick = () => {
    titleScreen.remove();
    play();
  };
  titleScreen.appendChild(startButton);

  // Add how-to-play button
  const howToPlayButton = document.createElement("div");
  howToPlayButton.textContent = "How to Play";
  howToPlayButton.style.backgroundColor = "#EE8321";
  howToPlayButton.style.borderRadius = "10px";
  howToPlayButton.style.padding = "6px";
  howToPlayButton.style.marginTop = "10px";
  howToPlayButton.style.cursor = "pointer";
  howToPlayButton.style.color = "#FBCF07";
  howToPlayButton.style.textShadow =
    "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000";
  howToPlayButton.style.fontSize = "0.8em";
  howToPlayButton.onmouseover = () => {
    howToPlayButton.style.backgroundColor = "#DD7311";
  };
  howToPlayButton.onmouseout = () => {
    howToPlayButton.style.backgroundColor = "#EE8321";
  };
  howToPlayButton.onclick = () => {
    titleScreen.remove();
    howToPlay();
  };
  titleScreen.appendChild(howToPlayButton);
}

titleScreen();
