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
      const closest = inputs.reduce((acc, point, i) => {
        const distance = calcDistance({ x, y }, point);
        if (distance < acc.distance) return { ...acc, distance, best: i, equidistant: false };
        if (distance === acc.distance) return { ...acc, equidistant: true };
        return acc;
      }, {
        equidistant: false,
        distance: Infinity,
        best: '.',
      });
      grid[y][x] = closest.equidistant ? '.' : closest.best;
    }
  }
  return grid;
};

const flattenArr = arr => arr.reduce((acc, arr) => [...acc, ...arr], []);

const determineAnswer = answerGrid => {
  const infinites = answerGrid.reduce((acc, row, i) => {
    if (i === 0 || i === answerGrid.length - 1) {
      row.forEach(pt => {
        if (acc.indexOf(pt) === -1) {
          acc.push(pt);
        }
      });
    } else {
      const first = row[0];
      const last = row[row.length -1];
      if (acc.indexOf(first) === -1) acc.push(first);
      if (acc.indexOf(last) === -1) acc.push(last);
    }
    return acc;
  }, ['.']);

  const answer = flattenArr(answerGrid).reduce((acc, symbol) => {
    if (infinites.indexOf(symbol) >= 0) return acc;
    return Object.assign(acc, {
      [symbol]: (acc[symbol] || 0) + 1
    })
  }, {});

  return Object.values(answer).reduce((acc, v) => v > acc ? v : acc, -Infinity);
}

(async () => {
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const inputs = unfilteredInputs.filter(filterFn);
  const grid = generateGrid(inputs);
  const answerGrid = fillGrid(inputs, grid);
  const answer = determineAnswer(answerGrid);

  console.log(`answer: ${answer}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
