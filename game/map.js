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

      // add the current node to closedSet
      closedSet.push([x, y]);

      // for each neighbor of the current node
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const neighborX = x + dx;
          const neighborY = y + dy;

          // if the neighbor is not traversable or is in closedSet, ignore it
          if (
            neighborX < 0 ||
            neighborX >= this.width ||
            neighborY < 0 ||
            neighborY >= this.height ||
            this.tiles.get(neighborX, neighborY).solid ||
            closedSet.includes([neighborX, neighborY])
          ) {
            continue;
          }

          // the distance from start to a neighbor
          const tentativeGScore = gScore.get(x, y) + 1;

          // if the neighbor is not in openSet, add it
          if (!openSet.includes([neighborX, neighborY])) {
            openSet.push([neighborX, neighborY]);
          } else if (tentativeGScore >= gScore.get(neighborX, neighborY)) {
            // this is not a better path
            continue;
          }

          // this path is the best until now, record it
          cameFrom.set(neighborX, neighborY, [x, y]);
          gScore.set(neighborX, neighborY, tentativeGScore);
          fScore.set(
            neighborX,
            neighborY,
            tentativeGScore + heuristic(neighborX, neighborY, x1, y1)
          );
        }
      }
    }

    // no path found
    return null;
  }
}

export default Map;
