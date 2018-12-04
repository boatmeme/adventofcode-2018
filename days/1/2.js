const { readFile } = require('../../utils');

const mostArray = [];

const contains = (val) => {
  if (!mostArray[val]) {
    mostArray[val] = 1;
    return 0;
  }
  return 1;
}

const reduceFrequencies = (inputs, acc = 0) => {
  for (let i = 0; i < inputs.length; i++) {
    const val = inputs[i];
    if (!val && val !== 0) continue;
    acc += val;
    if (contains(acc)) {
      return acc;
    }
  }
  return reduceFrequencies(inputs, acc);
}

const startTime = Date.now();

(async () => {
  const inputs = await readFile(
    `${__dirname}/input.txt`,
    v => parseInt(v, 10)
  );

  const answer = reduceFrequencies(inputs, 0);

  console.log(`answer: ${answer}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
