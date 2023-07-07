"use strict";

class Array2D {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Array(width * height);
  }

  get(x, y) {
    return this.data[y * this.width + x];
  }

  set(x, y, value) {
    this.data[y * this.width + x] = value;
  }

  fill(value) {
    this.data.fill(value);
  }
}

export default Array2D;
