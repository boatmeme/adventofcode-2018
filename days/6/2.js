const { readFile } = require('../../utils');

const startTime = Date.now();

const parseInteger = n => parseInt(n, 10);

const filterFn = o => o !== null;

const inputParser = str => {
  if (!str) return null;
  const [x, y] = str.split(', ');
  return {
    x: parseInteger(x),
    y: parseInteger(y),
  }
}

const generateGrid = inputs => {
  const bounds = inputs.reduce((acc, { x, y }) => {
    if (x > acc.maxX) {
      acc.maxX = x;
    }
    if (y > acc.maxY) {
      acc.maxY = y;
    }
    return acc;
  }, {
    maxX: -Infinity,
    maxY: -Infinity,
  });
  return Array(bounds.maxY + 1).fill().map(() => Array(bounds.maxX + 1).fill('.'));
}

const calcDistance = (a, b) => {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return dx + dy;
}

const fillGrid = (inputs, grid) => {
  const yLength = grid.length;
  for (let y = 0; y < yLength; y++) {
    const row = grid[y];
    const xLength = row.length
    for (let x = 0; x < xLength; x++) {
      const sum = inputs.reduce((acc, point) => {
        const distance = calcDistance({ x, y }, point);
        return acc + distance
      }, 0);
      grid[y][x] = sum;
    }
  }
  return grid;
};

const flattenArr = arr => arr.reduce((acc, arr) => [...acc, ...arr], []);

const determineAnswer = (answerGrid, max) => {
  return flattenArr(answerGrid).reduce((acc, symbol) => {
    if (symbol >= max) return acc;
    return acc + 1;
  }, 0);
}

(async () => {
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const inputs = unfilteredInputs.filter(filterFn);
  const grid = generateGrid(inputs);
  const answerGrid = fillGrid(inputs, grid);
  const answer = determineAnswer(answerGrid, 10000);

  console.log(`answer: ${answer}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
