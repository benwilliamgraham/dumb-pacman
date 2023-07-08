"use strict";

import Entity from "./entity.js";

class Ghost extends Entity {
  constructor(x, y) {
    super(x, y);
    this.tilesPerSecond = 5;
  }
}

export default Ghost;
