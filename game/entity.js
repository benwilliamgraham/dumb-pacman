"use strict";

class Entity {
  constructor(x, y, spritesheet) {
    this.prevX = x;
    this.prevY = y;
    this.targetX = x;
    this.targetY = y;
    this.x = x;
    this.y = y;
    this.nextPathX = null;
    this.nextPathY = null;
    this.path = null;
    this.pathProgress = 0;
    this.tilesPerSecond = 1;

    this.spritesheet = spritesheet;
    this.frame = 0;
    this.frameProgress = 0;
  }

  setPath(x, y) {
    this.nextPathX = x;
    this.nextPathY = y;
  }

  checkNewPath(map) {
    if (this.nextPathX !== null && this.nextPathY !== null) {
      this.path = map.getPath(
        this.prevX,
        this.prevY,
        this.nextPathX,
        this.nextPathY
      );

      // Remove first element of path if it is the current position
      if (
        this.path != null &&
        this.path.length > 0 &&
        this.path[0][0] === this.prevX &&
        this.path[0][1] === this.prevY
      ) {
        this.path = this.path.slice(1);
      }

      // Set target to first element of path
      if (this.path != null && this.path.length > 0) {
        this.targetX = this.path[0][0];
        this.targetY = this.path[0][1];
      } else {
        this.path = null;
        this.pathProgress = 0;
      }
      this.nextPathX = null;
      this.nextPathY = null;
      return true;
    }
    return false;
  }

  update(map, dt) {
    if (this.path !== null) {
      this.pathProgress += (dt / 1000) * this.tilesPerSecond;
      if (this.pathProgress >= 1) {
        this.prevX = this.targetX;
        this.prevY = this.targetY;

        this.pathProgress -= 1;

        if (!this.checkNewPath(map)) {
          this.path = this.path.slice(1);
          if (this.path.length === 0) {
            this.path = null;
            this.pathProgress = 0;
          } else {
            this.targetX = this.path[0][0];
            this.targetY = this.path[0][1];
          }
        }
      }
    } else {
      this.checkNewPath(map);
    }

    let xDir = this.targetX - this.prevX;
    if (Math.abs(xDir) > 1) {
      xDir = -Math.sign(xDir);
    }
    let yDir = this.targetY - this.prevY;
    if (Math.abs(yDir) > 1) {
      yDir = -Math.sign(yDir);
    }
    this.x = this.prevX + xDir * this.pathProgress;
    this.y = this.prevY + yDir * this.pathProgress;
  }

  animate(dt) {
    // Update frame
    this.frameProgress += (dt / 1000) * this.framesPerSecond;
    if (this.frameProgress >= 1) {
      this.frame = (this.frame + 1) % this.numFrames;
      this.frameProgress -= 1;
    }
  }
}

export default Entity;
