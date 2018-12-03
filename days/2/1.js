const { readFile } = require('../../utils');

const mostArray = [];

const countTwosAndThrees = (str = '') => {
  const chars = str.split('');
  const uniq = {};
  chars.forEach(c => {
    const exist = uniq[c] || 0;
    uniq[c] = exist + 1;
  });
  return Object.values(uniq).reduce(({ twos, threes }, val) => {
    if (val === 2) return { twos: 1, threes };
    if (val === 3) return { twos, threes: 1 };
    return { twos, threes };
  }, { twos: 0, threes: 0 });
}

const getCounts = (inputs = []) => {
  return inputs.map(countTwosAndThrees)
    .reduce(({ twos, threes }, val) => {
      return {
        twos: twos + val.twos,
        threes: threes + val.threes
      };
    }, { twos: 0, threes: 0 });
}

const startTime = Date.now();

(async () => {
  const inputs = await readFile(`${__dirname}/input.txt`);

  const { twos, threes } = getCounts(inputs)
  const answer = twos * threes;

  console.log(`answer: ${answer}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
