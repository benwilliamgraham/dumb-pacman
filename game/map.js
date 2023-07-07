"use strict";

import Array2D from "./array2d.js";

class Map {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.tiles = new Array2D(width, height);
    this.visibility = new Array2D(width, height);
  }

  getPath(x0, y0, x1, y1) {
    // compute the shortest path between two points
    // using the A* algorithm

    // heuristic function
    function heuristic(x0, y0, x1, y1) {
      return Math.abs(x0 - x1) + Math.abs(y0 - y1);
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
        // skip neighbors that are outside the map
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
          continue;
        }

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
