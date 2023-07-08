"use strict";

import Entity from "./entity.js";

class Pacman extends Entity {
  constructor(x, y) {
    super(x, y);
    this.tilesPerSecond = 2;
    this.targetGhost = null;
  }

  update(map, dt, ghosts) {
    super.update(map, dt);

    // Determine the closest ghost
    let closestGhost = null;
    let closestDistance = Infinity;
    for (const ghost of ghosts) {
      const distance =
        Math.min(
          Math.abs(this.x - ghost.x),
          map.width - Math.abs(this.x - ghost.x)
        ) +
        Math.min(
          Math.abs(this.y - ghost.y),
          map.height - Math.abs(this.y - ghost.y)
        );
      if (distance < closestDistance) {
        closestGhost = ghost;
        closestDistance = distance;
      }
    }
    this.targetGhost = closestGhost;
    if (this.path === null) {
      this.setPath(this.targetGhost.prevX, this.targetGhost.prevY);
    }
  }
}

export default Pacman;
