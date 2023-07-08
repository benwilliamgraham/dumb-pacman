"use strict";

import Entity from "./entity.js";

class Pacman extends Entity {
  constructor(x, y) {
    super(x, y);
    this.tilesPerSecond = 3;
    this.targetGhost = null;
  }

  update(map, dt, ghosts) {
    super.update(map, dt);

    // Determine the closest ghost
    let closestGhost = null;
    let closestDistance = Infinity;
    for (const ghost of ghosts) {
      const distance = Math.sqrt(
        Math.pow(this.x - ghost.x, 2) + Math.pow(this.y - ghost.y, 2)
      );
      if (distance < closestDistance) {
        closestGhost = ghost;
        closestDistance = distance;
      }
    }
    this.targetGhost = closestGhost;
    if (this.path === null) {
      this.setPath(this.targetGhost.x, this.targetGhost.y);
    }
  }
}

export default Pacman;
