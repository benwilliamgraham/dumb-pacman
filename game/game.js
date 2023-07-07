"use strict";

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

class Map {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.tiles = new Array(width * height);
    this.visibility = new Array(width * height);
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i] = new Tile(false);
      this.visibility[i] = false;
    }
  }

  getTile(x, y) {
    return this.tiles[y * this.width + x];
  }

  setTile(x, y, tile) {
    this.tiles[y * this.width + x] = tile;
  }

  isVisible(x, y) {
    return this.visibility[y * this.width + x];
  }

  setVisible(x, y, visible) {
    this.visibility[y * this.width + x] = visible;
  }
}

function computeVisibility(map, x, y, radius) {
  // Reset visibility
  for (let i = 0; i < map.visibility.length; i++) {
    map.visibility[i] = false;
  }

  function castRay(x, y, dx, dy, radius) {
    let sx = x;
    let sy = y;
    for (let i = 0; i < radius; i++) {
      const tx = Math.floor(sx);
      const ty = Math.floor(sy);
      if (
        tx < 0 ||
        tx >= map.width ||
        ty < 0 ||
        ty >= map.height ||
        map.getTile(tx, ty).solid
      ) {
        return;
      }
      map.setVisible(tx, ty, true);
      sx += dx;
      sy += dy;
    }
  }

  // Cast rays
  for (let i = 0; i < 360; i += 2) {
    const angle = (i * Math.PI) / 180;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    castRay(x, y, dx, dy, radius);
  }
}

function play() {
  loadImages();

  const map = new Map(mapWidth, mapHeight);
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      if (Math.random() < 0.1) {
        map.setTile(x, y, new Tile(true, "demo"));
      }
    }
  }

  const visibility = new Array(mapWidth * mapHeight);
  for (let i = 0; i < visibility.length; i++) {
    visibility[i] = false;
  }

  function draw(time) {
    // Compute visibility
    computeVisibility(map, mouse.x / tileSize, mouse.y / tileSize, 10);

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tile = map.getTile(x, y);
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
        if (!map.isVisible(x, y)) {
          context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

play();
