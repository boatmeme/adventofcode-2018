const { readFile } = require('../../utils');

const startTime = Date.now();

const parseInteger = n => parseInt(n, 10);

const inputParser = str => {
  if (!str) return null;
  const [claimStr, atStr, coordsStr, dimStr] = str.split(' ');
  const dims = dimStr.split('x').map(parseInteger);
  const coords = coordsStr.replace(':', '').split(',').map(parseInteger);
  const claim = claimStr.replace('#', '');
  return {
    claim,
    coords,
    dims,
  }
}

const measureOverlap = (claims = []) => {
  const { maxX, maxY } = claims.reduce(({ maxX, maxY }, { coords, dims }) => {
    const X = coords[0] + dims[0];
    const Y = coords[1] + dims[1];
    let newMaxX = maxX;
    let newMaxY = maxY;
    if (X > maxX) newMaxX = X;
    if (Y > maxY) newMaxY = Y;
    return { maxX: newMaxX, maxY: newMaxY };
  }, { maxX: 0, maxY: 0 });

  const grid = Array(maxY).fill().map(() => Array(maxX).fill(0));

  claims.forEach(({ coords, dims }) => {
    const [ xoffset, yoffset ] = coords;
    const [ xlength, ylength ] = dims;
    for (let y = ylength - 1 + yoffset; y >= yoffset; y--) {
      for (let x = xlength - 1 + xoffset; x >= xoffset; x--) {
        grid[y][x] = grid[y][x] + 1;
      }
    }
  });

  return claims.filter(({ coords, dims }) => {
    const subgrid = [];
    const [ xoffset, yoffset ] = coords;
    const [ xlength, ylength ] = dims;
    for (let y = ylength - 1 + yoffset; y >= yoffset; y--) {
      for (let x = xlength - 1 + xoffset; x >= xoffset; x--) {
        subgrid.push(grid[y][x]);
      }
    }
    return subgrid.filter(x => x > 1).length === 0
  });
}

(async () => {
  const inputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const filteredInputs = inputs.filter(o => o !== null);

  const [ answer ] = measureOverlap(filteredInputs);

  console.log(`answer: ${answer.claim}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
