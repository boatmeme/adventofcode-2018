class FuelCell {
  constructor(x, y) {
      this.x = x + 1;
      this.y = y + 1;
      this.power = null;
      this.rackId = null;

  }

  getPower(serial = 0) {
    if (this.power !== null) return this.power;
    // Power Algo
    const rackId = this.rackId = this.x + 10;
    let power = rackId * this.y;
    power += serial;
    power = power * rackId;
    const charArray = `${power}`.split('');
    const digit = parseInt(charArray[charArray.length-3] || 0, 10);
    this.power = digit - 5;
    return this.power;
  }
}

class Square {
  constructor(cell, power, size) {
    this.cell = cell;
    this.power = power;
    this.size = size;
  }
}

const gridDims = [300, 300];
const grid = new Array(gridDims[0] * gridDims[1]).fill(null).map((o, i) => new FuelCell(i % gridDims[1], Math.floor(i / gridDims[0])));
let max = new Square({}, -Infinity);
const serial = 9810;

const tryDimension = (dim) => {
  const answerDims = [dim, dim];
  for (let y = 0; y < gridDims[0] - answerDims[0]; y++ ) {
    for (let x = 0; x < gridDims[1] - answerDims[1]; x++ ) {
      let power = 0;
      const squareIndex = (y * gridDims[0]) + x;
      for (let cy = 0; cy < answerDims[0]; cy++) {
        const getY = squareIndex + (gridDims[0] * cy);
        for (let cx = 0; cx < answerDims[1]; cx++) {
          const index = getY + cx;
          power += grid[index].getPower(serial);
        }
      }
      //console.log(power, max.power)
      if (power > max.power) {
        max = new Square(grid[squareIndex], power, dim);
      }
    }
  }
}

for (let d = 1; d <= gridDims[0]; d++) {
  tryDimension(d);
  console.log(d, max);
}
console.log(max);
