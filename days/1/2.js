const { readFile } = require('../../utils');

const mostArray = [];

const contains = (arr = [], val) => {
  if (!mostArray[val]) {
    mostArray[val] = 1;
    return 0;
  }
  return 1;
}

const reduceFrequencies = (inputs, startAcc = 0, startFreq = []) => {
  return inputs.reduce(({ acc, freq, first }, val) => {
    if (!val && val !== 0) return { acc, freq, first };
    const newFreq = acc + val;
    return {
      acc: newFreq,
      freq: [...freq, newFreq],
      first: first > -Infinity
        ? first
        : contains( freq, newFreq )
          ? newFreq
          : first,
    }
  }, { acc: startAcc, freq: startFreq, first: -Infinity });
}

const startTime = Date.now();

(async () => {
  const inputs = await readFile(
    `${__dirname}/input.txt`,
    v => parseInt(v, 10)
  );

  let answer = reduceFrequencies(inputs, 0)
  while(answer.first == -Infinity) {
    answer = reduceFrequencies(inputs, answer.acc, answer.freq);
  }

  console.log(`answer: ${answer.first}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
