"use strict";

import Entity from "./entity.js";

class Ghost extends Entity {
  constructor(x, y, spritesheet, color) {
    super(x, y, spritesheet);
    this.color = color;
    this.tilesPerSecond = 5;
    this.framesPerSecond = 10;
    this.numFrames = 7;
  }
}

export default Ghost;
