const { readFile } = require('../../utils');

const startTime = Date.now();

const parseInteger = n => parseInt(n, 10);

const filterFn = o => o !== null;

const inputParser = str => {
  if (!str) return null;
  return str.split(' ').map(parseInteger);
}

const sum = arr => arr.reduce((acc, n) => acc + n, 0);

const sumMetas = arr => {
  const [childCount, metaCount, ...rest] = arr;
  let data = rest;
  // console.log(childCount, metaCount, rest)
  let total = 0;
  for (let i = childCount; i > 0; i--) {
    const { total: newTotal, data: newData } = sumMetas(data);
    total += newTotal;
    data = newData;
  }

  total += sum(data.slice(0, metaCount));
  return { total, data: data.slice(metaCount) }
}

(async () => {
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const [ inputs ] = unfilteredInputs.filter(filterFn);
  const answer = sumMetas(inputs);

  console.log(`answer: ${answer.total}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
