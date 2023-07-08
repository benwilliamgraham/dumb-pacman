"use strict";

import Array2D from "./array2d.js";

class Map {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.tiles = new Array2D(width, height);
  }

  getPath(x0, y0, x1, y1) {
    // compute the shortest path between two points
    // using the A* algorithm

    // First, if the end point is solid, find the nearest non-solid point
    x1 = Math.min(Math.max(x1, 0), this.width - 1);
    y1 = Math.min(Math.max(y1, 0), this.height - 1);
    if (this.tiles.get(x1, y1).solid) {
      const queue = [[x1, y1]];
      const visited = new Array2D(this.width, this.height);
      visited.set(x1, y1, true);
      while (queue.length > 0) {
        const [x, y] = queue.shift();
        if (!this.tiles.get(x, y).solid) {
          x1 = x;
          y1 = y;
          break;
        }
        for (const [dx, dy] of [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ]) {
          const x2 = Math.min(Math.max(x + dx, 0), this.width - 1);
          const y2 = Math.min(Math.max(y + dy, 0), this.height - 1);
          if (!visited.get(x2, y2)) {
            queue.push([x2, y2]);
            visited.set(x2, y2, true);
          }
        }
      }
    }

    // heuristic function
    const width = this.width;
    const height = this.height;
    function heuristic(x0, y0, x1, y1) {
      const dx = Math.min(Math.abs(x1 - x0), width - Math.abs(x1 - x0));
      const dy = Math.min(Math.abs(y1 - y0), height - Math.abs(y1 - y0));
      return dx + dy;
    }

    // openSet contains the nodes that have been discovered
    const openSet = [[x0, y0]];

    // cameFrom contains the node that each node came from
    const cameFrom = new Array2D(this.width, this.height);
    cameFrom.fill(null);

    // gScore contains the cost of getting from the start node to that node
    const gScore = new Array2D(this.width, this.height);
    gScore.fill(Infinity);
    gScore.set(x0, y0, 0);

    // fScore contains the cost of getting from the start node to the goal
    const fScore = new Array2D(this.width, this.height);
    fScore.fill(Infinity);
    fScore.set(x0, y0, heuristic(x0, y0, x1, y1));

    while (openSet.length > 0) {
      // find the node in openSet with the lowest fScore
      let lowestIndex = 0;
      for (let i = 0; i < openSet.length; i++) {
        const [x, y] = openSet[i];
        if (
          fScore.get(x, y) <
          fScore.get(openSet[lowestIndex][0], openSet[lowestIndex][1])
        ) {
          lowestIndex = i;
        }
      }

      const [x, y] = openSet[lowestIndex];
      if (x === x1 && y === y1) {
        // we have reached the goal
        const path = [];
        let current = [x1, y1];
        while (current !== null) {
          path.push(current);
          current = cameFrom.get(current[0], current[1]);
        }
        return path.reverse();
      }

      // remove the current node from openSet
      openSet.splice(lowestIndex, 1);

      // iterate over the neighbors of the current node
      for (let [nx, ny] of [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]) {
        // wrap around the map
        nx = (nx + width) % width;
        ny = (ny + height) % height;

        // skip neighbors that are walls
        if (this.tiles.get(nx, ny).solid) {
          continue;
        }

        // compute the cost of getting from the start node to this neighbor
        const tentativeGScore = gScore.get(x, y) + 1;

        // record this path if it is better than the previous one
        if (tentativeGScore < gScore.get(nx, ny)) {
          // this path is the best until now, record it!
          cameFrom.set(nx, ny, [x, y]);
          gScore.set(nx, ny, tentativeGScore);
          fScore.set(nx, ny, tentativeGScore + heuristic(nx, ny, x1, y1));

          // add this neighbor to openSet
          openSet.push([nx, ny]);
        }
      }
    }

    // no path found
    return null;
  }
}

export default Map;
