const { readFile } = require('../../utils');

const startTime = Date.now();

const parseInteger = n => parseInt(n, 10);

const filterFn = o => o !== null;

const inputParser = str => {
  if (!str) return null;
  return str.split(' ').map(parseInteger);
}

const sum = arr => arr.reduce((acc, n) => acc + n, 0);

const sumMetadataValues = (values, metaArray) => metaArray.reduce((acc, i) => {
  const v = values[i-1];
  if (v) return acc + v;
  return acc;
}, 0);

const sumMetas = arr => {
  const [childCount, metaCount, ...rest] = arr;
  let data = rest;
  // console.log(childCount, metaCount, rest)
  let values = [];
  let total = 0;
  for (let i = childCount; i > 0; i--) {
    const { total: newTotal, value: newValue, data: newData } = sumMetas(data);
    total += newTotal;
    data = newData;
    values = [...values, newValue];
  }
  const metaValues = data.slice(0, metaCount);
  const metaTotals = sum(metaValues);
  total += metaTotals;
  const returnVal = { total, data: data.slice(metaCount) };
  if (childCount === 0) {
    return { ...returnVal, value: metaTotals };
  }
  return { ...returnVal, value: sumMetadataValues(values, metaValues) };

}

(async () => {
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const [ inputs ] = unfilteredInputs.filter(filterFn);
  const answer = sumMetas(inputs);
  console.log(`answer: ${answer.value}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
