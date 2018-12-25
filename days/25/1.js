const { readFile } = require('../../utils');

const startTime = Date.now();

const parseInteger = s => parseInt(s, 10);

const inputParser = str => {
  if (!str) return null;
  return str.split(',').map(parseInteger);
}

const filterFn = o => o !== null;

const manhattan = ([aw, ax, ay, az], [bw, bx, by, bz]) => Math.abs(aw - bw) + Math.abs(ax - bx) + Math.abs(ay - by) + Math.abs(az - bz);

const inRange = (coords, arr, range) => arr.filter(o => manhattan(coords, o) <= range);

(async () => {
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const arr = unfilteredInputs.filter(filterFn);

  const range = 3;
  const constellations = [];
  const answer = arr.reduce((constellations, coords) => {
    const joined = [];
    for (let i = 0; i < constellations.length; i++) {
      if (inRange(coords, constellations[i], range).length > 0) {
        joined.push(constellations[i]);
        constellations[i] = null;
      }
    }
    if (joined.length > 0) {
      return [...constellations.filter(c => c !== null), joined.reduce((acc, c) => [...acc, ...c], [coords])];
    }
    return [...constellations, [coords]];
  }, []);
  console.log(`answer: ${answer.length}\n`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
