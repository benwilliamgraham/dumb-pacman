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
        } else {
          this.targetX = this.path[0][0];
          this.targetY = this.path[0][1];
        }
      }
    }
    this.x = this.prevX + (this.targetX - this.prevX) * this.pathProgress;
    this.y = this.prevY + (this.targetY - this.prevY) * this.pathProgress;
  }
}

export default Ghost;
