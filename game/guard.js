"use strict";

class Guard {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  computeVisibility(map, x, y, direction, fov, radius) {
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

  update(map) {
    this.computeVisibility(map, this.x, this.y, this.direction, 100, 10);
  }
}

export default Guard;
