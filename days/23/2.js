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

class Point {
  constructor(name, point, type) {
    this.name = name;
    this.point = point;
    this.type = type;
  }
}

const marzullo = (ranges) => {
  let best = 0;
  let count = 0;
  let beststart = 0;
  let bestend = 0;
  let i = 0;
  let name = "";
  let points = [];

  ranges.forEach(bot => {
    points.push(new Point(bot, bot.min, -1));
    points.push(new Point(bot, bot.max, 1));
  });

  points.sort(function(a, b) {
    return (a.point - b.point) || (b.type - a.type);
  });

  points.forEach(function(p) {
    count = count - p.type;
    if(best < count) {
      best = count;
      beststart = p.point;
      if (i < points.length-1) {
        bestend = points[i+1].point;
        name = p.name + "," + points[i+1].name;
      }
    }
    i++;
  });
  return { start: beststart, end: bestend };
}

(async () => {
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const arr = unfilteredInputs.filter(filterFn);

  const volumes = mapVolumes(arr);
  const answer = marzullo(arr);

  console.log(answer);
  //console.log(`answer: ${inRangeBots.length}\n`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
