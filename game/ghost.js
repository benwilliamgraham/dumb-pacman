"use strict";

const tilesPerSecond = 5;

class Ghost {
  constructor(x, y) {
    this.prevX = x;
    this.prevY = y;
    this.targetX = x;
    this.targetY = y;
    this.x = x;
    this.y = y;
    this.path = null;
    this.pathProgress = 0;
  }

  setPath(path) {
    // if it's already on a path, keep the next tile
    if (this.path !== null && path !== null) {
      this.path = [this.path[0]].concat(path);
    } else {
      this.path = path;
    }
  }

  update(map, dt) {
    if (this.path !== null) {
      this.pathProgress += (dt / 1000) * tilesPerSecond;
      if (this.pathProgress >= 1) {
        this.prevX = this.targetX;
        this.prevY = this.targetY;

        this.pathProgress -= 1;
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
}

export default Ghost;
