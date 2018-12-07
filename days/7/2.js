const { readFile } = require('../../utils');
const Job = require('./Job');

const startTime = Date.now();

const parseInteger = n => parseInt(n, 10);

const filterFn = o => o !== null;

const characterRegex = /^.*\s([A-Z])\s.*\s([A-Z])\s.*/;
const inputParser = str => {
  if (!str) return null;
  const match = characterRegex.exec(str);
  return {
    pre: match[1],
    step: match[2],
  }
}

(async () => {
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const inputs = unfilteredInputs.filter(filterFn);
  const job = new Job(inputs, 5);
  job.start();

  console.log(`${job.toString()}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
