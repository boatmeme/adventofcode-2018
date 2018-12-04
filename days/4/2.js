const { readFile } = require('../../utils');

const startTime = Date.now();

const parseInteger = n => parseInt(n, 10);

const DATE_REGEX = /\[(\d\d\d\d-\d\d-\d\d)\s(\d\d):(\d\d)\]\s(.*)/;
const GUARD_REGEX = /Guard #(\d*)/;

const inputParser = str => {
  if (!str) return null;
  const [full, dateStr, hourStr, minuteStr, actionStr] = DATE_REGEX.exec(str);
  return {
    dateStr,
    hourStr,
    minuteStr,
    hour: parseInteger(hourStr),
    minute: parseInteger(minuteStr),
    actionStr,
  }
}

const filterFn = o => o !== null;

const sortFn = (a, b) => {
  const x = `${a.dateStr}${a.hourStr}${a.minuteStr}`;
  const y = `${b.dateStr}${b.hourStr}${b.minuteStr}`;
  return x < y ? -1 : x > y ? 1 : 0;
}

const buildShiftArray = inputs => {
  return inputs.reduce((acc, obj) => {
    const match = GUARD_REGEX.exec(obj.actionStr);
    if (match) {
      return [...acc, Object.assign(obj, { guard: match[1], shift: Array(60).fill(0) })];
    } else {
      const shiftObj = acc[acc.length-1];
      if (obj.actionStr === 'falls asleep') {
        shiftObj.lastAsleep = obj.minute;
      } else if (obj.actionStr === 'wakes up') {
        for (let i = shiftObj.lastAsleep; i < obj.minute; i++) {
          shiftObj.shift[i] = 1;
        }
      }
      return acc;
    }
  }, []);
}

const buildGuardStats = inputs => {
  return inputs.reduce((acc, obj) => {
    const hourArr = acc[obj.guard] || Array(60).fill(0);
    const { shift } = obj;
    return Object.assign(acc, {
      [obj.guard]: shift.map((h, i) => hourArr[i] + h)
    });
  }, {});
}

const findBestGuard = guardStats => {
  return Object.keys(guardStats).reduce((acc, k) => {
    const { max, sum, maxIndex } = guardStats[k].reduce((stats, o, i) => {
      const lmax = o > stats.max ? o : stats.max;
      const lmaxIndex = o > stats.max ? i : stats.maxIndex;
      return { max: lmax, maxIndex: lmaxIndex };
    }, { max: 0, maxIndex: 0});
    if (max > acc.maxMinute) {
      return { guard: parseInteger(k), maxMinute: max, bestMinute: maxIndex };
    }
    return acc;
  }, { maxMinute: -Infinity, bestMinute: -Infinity, guard: -Infinity });
}

(async () => {
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const inputs = unfilteredInputs.filter(filterFn).sort(sortFn);
  const shiftArr = buildShiftArray(inputs);
  const guardStats = buildGuardStats(shiftArr);
  const bestGuard = findBestGuard(guardStats);

  console.log(bestGuard);
  const answer = bestGuard.guard * bestGuard.bestMinute;

  console.log(`answer: ${answer}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
