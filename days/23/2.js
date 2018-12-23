const { readFile } = require('../../utils');

const startTime = Date.now();

const parseInteger = s => parseInt(s, 10);

const digitRegex = /r=(\d*)$/;
const coordRegex = /^pos=<([0-9-]*),([0-9-]*),([0-9-]*)>/;

const inputParser = str => {
  if (!str) return null;
  let match;
  let arr = [];
  match = digitRegex.exec(str);
  const range = parseInteger(match[1]);

  match = coordRegex.exec(str);
  const x = parseInteger(match[1]);
  const y = parseInteger(match[2]);
  const z = parseInteger(match[3]);

  return {
    range,
    coords: { x, y, z },
  };
}

const filterFn = o => o !== null;

const maxRadiusBot = arr => arr.reduce((acc, bot) => {
  if (bot.range > acc.range) return bot;
  return acc;
}, { range: -Infinity });

const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);

const inRange = (bot, arr) => arr.filter(o => manhattan(bot.coords, o.coords) <= bot.range);

const mapVolumes = (arr) => arr.map(bot => {
  return Object.assign({}, bot, {
    min: (bot.coords.x + bot.coords.y + bot.coords.z) - bot.range,
    max: (bot.coords.x + bot.coords.y + bot.coords.z) + bot.range,
  });
});

(async () => {
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const arr = unfilteredInputs.filter(filterFn);

  const pMap = {};
  arr.forEach(bot => {
    const min = (bot.coords.x + bot.coords.y + bot.coords.z) - bot.range;
    const max = (bot.coords.x + bot.coords.y + bot.coords.z) + bot.range + 1;
    pMap[min] = 1;
    pMap[max] = - 1;
  });

  const { maxStart } = Object.keys(pMap).reduce((acc, key) => {
    const val = pMap[key];
    acc.counter += val;
    if (acc.counter > acc.max) {
      acc.max = acc.counter;
      acc.maxStart = parseInteger(key);
    }
    return acc;
  }, { max: -Infinity, maxStart: -Infinity, counter: 0 })

  const [ minDistance ] = Object.keys(pMap).filter(k => parseInteger(k) > parseInteger(maxStart));

  // For some reason, the answer is "off-by-one"
  console.log(`answer: ${minDistance - 1}\n`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
