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

class Grid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Array(width * height);
  }

  get(x, y) {
    return this.data[y * this.width + x];
  }

  set(x, y, value) {
    this.data[y * this.width + x] = value;
  }
}

class Map {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.tiles = new Grid(width, height);
    this.visibility = new Grid(width, height);
  }

  resetVisibility() {
    for (let y = 0; y < this.visibility.height; y++) {
      for (let x = 0; x < this.visibility.width; x++) {
        this.visibility.set(x, y, false);
      }
    }
  }

  getPath(x0, y0, x1, y1) {
    // compute the shortest path between two points
    // using the A* algorithm

    const openSet = [[x0, y0]];

    class CameFromMap {
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.cameFrom = new Array(width * height);
        for (let i = 0; i < this.cameFrom.length; i++) {
          this.cameFrom[i] = null;
        }
      }

      get(x, y) {
        return this.cameFrom[y * this.width + x];
      }

      set(x, y, value) {
        this.cameFrom[y * this.width + x] = value;
      }
    }
    const cameFrom = new CameFromMap(this.width, this.height);

    const gScore = new Array(this.width * this.height);
    for (let i = 0; i < gScore.length; i++) {
      gScore[i] = Infinity;
    }
    gScore[y0 * this.width + x0] = 0;
  }
}

class Guard {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  update(map) {
    computeVisibility(map, this.x, this.y, this.direction, 100, 10);
  }
}

function computeVisibility(map, x, y, direction, fov, radius) {
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
        map.tiles.get(tx, ty).solid
      ) {
        return;
      }
      map.visibility.set(tx, ty, true);
      sx += dx;
      sy += dy;
    }
  }

  // Cast rays
  for (let i = direction - fov / 2; i < direction + fov / 2; i += 2) {
    const angle = (i * Math.PI) / 180;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    castRay(x, y, dx, dy, radius);
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
    map.resetVisibility();
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
