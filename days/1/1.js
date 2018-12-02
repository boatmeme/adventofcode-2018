const { readFile } = require('../../utils');

(async () => {
  const inputs = await readFile(
    `${__dirname}/input.txt`,
    v => parseInt(v, 10)
  );

  const answer = inputs.reduce((acc, val) => {
    if (!val) return acc;
    return acc + val;
  }, 0);
  console.log(answer);
})();
