"use strict";

import Entity from "./entity.js";

class Pacman extends Entity {
  constructor(x, y, spritesheet) {
    super(x, y, spritesheet);

    this.direction = "right";

    this.tilesPerSecond = 2.5;
    this.targetGhost = null;

    this.framesPerSecond = 10;
    this.numFrames = 4;
  }

  getDirection() {
    // Make the direction either left or right
    if (this.path === null || this.path.length === 0) {
      return this.direction;
    }

    const nextX = this.path[0][0];
    const nextY = this.path[0][1];

    if (nextX === this.prevX) {
      if (nextY === this.prevY - 1) {
        return this.direction;
      } else if (nextY === this.prevY + 1) {
        return this.direction;
      }
    } else if (nextY === this.prevY) {
      if (nextX === this.prevX - 1) {
        return "left";
      } else if (nextX === this.prevX + 1) {
        return "right";
      }
    }
  }

  update(map, dt, ghosts) {
    super.update(map, dt);

    this.direction = this.getDirection();

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

    this.setPath(closestGhost.prevX, closestGhost.prevY);
  }
}

export default Pacman;
