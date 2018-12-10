const { readFile } = require('../../utils');

const startTime = Date.now();

const parseInteger = n => parseInt(n, 10);

const filterFn = o => o !== null;

const characterRegex = /^position=<(.*)> velocity=<(.*)>$/;

const inputParser = str => {
  if (!str) return null;
  const match = characterRegex.exec(str);
  const position = match[1].trim().split(', ').map(parseInteger);
  const velocity = match[2].trim().split(', ').map(parseInteger);

  return {
    position,
    velocity,
  }
}

const wait = timeInMillis => new Promise((resolve, reject) => setTimeout(resolve, timeInMillis));

const calcGridStats = pts => pts.reduce((acc, pt) => {
  const minX = pt[0] < acc.minX ? pt[0] : acc.minX;
  const minY = pt[1] < acc.minY ? pt[1] : acc.minY;
  const maxX = pt[0] > acc.maxX ? pt[0] : acc.maxX;
  const maxY = pt[1] > acc.maxY ? pt[1] : acc.maxY;
  return { minY, minX, maxY, maxX, ptsMap: Object.assign(acc.ptsMap, { [`${pt[0]},${pt[1]}`]: true }) };
}, { minY: Infinity, minX: Infinity, maxY: -Infinity, maxX: -Infinity, ptsMap: {} });

const timeTravel = async (pts) => {
  let counter = 0;
  let lastArea;
  let area = Infinity;

  do {
    lastArea = area;
    let acc = { minY: Infinity, minX: Infinity, maxY: -Infinity, maxX: -Infinity };
    pts.forEach(pt => {
      const x = pt.position[0];
      const y = pt.position[1];
      pt.position[0] = x + pt.velocity[0];
      pt.position[1] = y + pt.velocity[1];

      acc.minX = pt.position[0] < acc.minX ? pt.position[0] : acc.minX;
      acc.minY = pt.position[1] < acc.minY ? pt.position[1] : acc.minY;
      acc.maxX = pt.position[0] > acc.maxX ? pt.position[0] : acc.maxX;
      acc.maxY = pt.position[1] > acc.maxY ? pt.position[1] : acc.maxY;
    });
    area = (acc.maxY - acc.minY) * (acc.maxX - acc.minX);
    counter++;
    if (area < 6400) {
      const map = pts.map(({ position }) => position);
      console.clear();
      drawSky(map);
      await wait(650);
    }
  } while (area < lastArea);
}

const drawSky = pts => {
  const { minY, minX, maxX, maxY, ptsMap } = calcGridStats(pts);

  for (let y = minY; y <= maxY; y++) {
    process.stdout.write(`\n`);
    for (let x = minX; x <= maxX; x++) {
      const char = ptsMap[`${x},${y}`] ? 'X' : '.';
      process.stdout.write(`${char}`);
    }
  }
}

(async () => {
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const inputs = unfilteredInputs.filter(filterFn);
  await timeTravel(inputs, 50);

  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
