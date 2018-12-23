const startTime = Date.now();

const { Graph, astar, Point } = require('./Astar');

const ROCKY = 0;
const WET = 1;
const NARROW = 2;

const CLIMBING_GEAR = 1;
const TORCH = 0;
const NEITHER = 2;

class Region {
  constructor(x, y, grid) {
    this.x = x;
    this.y = y;
    this.grid = grid;
    this._geologicIndex = -1;
    this._erosionLevel = -1;
    this._type = null;
    this.weight = 1;
    this.gear = TORCH;
    this.target = false;
  }
  getGeologicIndex() {
    if (this._geologicIndex > -1) return this._geologicIndex;
    if (this.x === 0 && this.y === 0) {
      this._geologicIndex = 0;
    } else if (this.x === this.grid.target.x && this.y === this.grid.target.y) {
      this._geologicIndex = 0;
    } else if (this.x === 0) {
      this._geologicIndex = this.y * 48271;
    } else if (this.y === 0) {
      this._geologicIndex = this.x * 16807;
    } else {
      this._geologicIndex = this.grid.grid[this.y][this.x-1].getErosionLevel() * this.grid.grid[this.y-1][this.x].getErosionLevel();
    }
    return this._geologicIndex;
  }
  getErosionLevel() {
    if (this._erosionLevel > -1) return this._erosionLevel;
    this._erosionLevel = (this.getGeologicIndex() + this.grid.depth) % 20183;
    return this._erosionLevel;
  }
  getType() {
    if (this._type) return this._type;
    const el = this.getErosionLevel();
    this._type = el % 3;
    return this._type;
  }
  getAlternateGear() {
    const type = this.getType();
    switch (type) {
      case ROCKY: {
        return this.gear === CLIMBING_GEAR ? TORCH : CLIMBING_GEAR;
      }
      case WET: {
        return this.gear === CLIMBING_GEAR ? NEITHER : CLIMBING_GEAR;
      }
      case NARROW: {
        return this.gear === TORCH ? NEITHER : TORCH;
      }
      default: return;
    }
  }
  canUse(gear) {
    const type = this.getType();
    switch (type) {
      case ROCKY: {
        if (gear === CLIMBING_GEAR || gear === TORCH){
          return true;
        }
        return false;
      }
      case WET: {
        if (gear === CLIMBING_GEAR || gear === NEITHER){
          return true;
        }
        return false;
        break;
      }
      case NARROW: {
        if (gear === TORCH || gear === NEITHER){
          return true;
        }
        return false
        break;
      }
      default:
        return false;
    }
  }
  toString() {
    if (this.x === 0 && this.y === 0) {
      return 'M';
    } else if (this.x === this.grid.target.x && this.y === this.grid.target.y) {
      return 'T';
    } else {
      const type = this.getType();
      switch (type) {
        case 0:
          return '.';
        case 1:
          return '=';
        default:
          return '|';
      }
    }
  }
}

class Map {
  constructor(depth, { x, y }, dimensions) {
    this.depth = depth;
    this.target = { x, y };
    this.grid = Array(dimensions.y+1).fill(null).map((a, y) => {
      return Array(dimensions.x+1).fill(null).map((b, x) => {
        return new Region(x, y, this);
      })
    });
    this.grid[this.target.y][this.target.x].target = true;
  }

  getRiskArea() {
    return this.grid.reduce((acc, row) => {
      return acc + row.reduce((a, region) => {
        return a + region.getType();
      }, 0)
    }, 0);
  }

  getAstarGraph() {
    return new Graph(this.grid);
  }

  findShortestPath(start = { x: 0, y: 0 }, end = this.target) {
    const graph = this.getAstarGraph();
    return astar.search(graph, new Point(start, TORCH), new Point(end, TORCH), { heuristic: () => 0 });
  }
}

(async () => {
  const depth = 5616;
  const target = { x: 10, y: 785 };
  const dimensions = { x: 100, y: 1000 };

  const map = new Map(depth, target, dimensions);
  const answer = map.findShortestPath();

  console.log(`answer: ${answer[answer.length-1].f}\n`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
