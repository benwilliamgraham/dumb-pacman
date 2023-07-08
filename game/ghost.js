"use strict";

import Entity from "./entity.js";

class Ghost extends Entity {
  constructor(x, y, spritesheet) {
    super(x, y, spritesheet);
    this.tilesPerSecond = 5;
    this.framesPerSecond = 10;
    this.numFrames = 7;
  }
}

export default Ghost;
