const startTime = Date.now();

class Region {
  constructor(x, y, grid) {
    this.x = x;
    this.y = y;
    this.grid = grid;
    this._geologicIndex = -1;
    this._erosionLevel = -1;
    this._type = null;
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
  constructor(depth, { x, y }) {
    this.depth = depth;
    this.target = { x, y };
    this.grid = Array(y+1).fill(null).map((a, y) => {
      return Array(x+1).fill(null).map((b, x) => {
        return new Region(x, y, this);
      })
    });
  }

  getRiskArea() {
    return this.grid.reduce((acc, row) => {
      return acc + row.reduce((a, region) => {
        return a + region.getType();
      }, 0)
    }, 0);
  }
}

(async () => {
  const depth = 5616;
  const target = { x: 10, y: 785 };

  const map = new Map(depth, target);
  const answer = map.getRiskArea();


  console.log(`answer: ${answer}\n`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
