const { readFile } = require('../../utils');

const mostArray = [];

const compare = (arr = []) => {
  if (arr.length < 2) return;
  const [head, ...tail] = arr;
  const base = head.split('');

  const candidates = tail.map(t => {
    const matches = [];
    const candidate = t.split('');
    candidate.forEach((c, i) => {
      if (c === base[i]) {
        matches.push(c);
      }
    });
    return matches;
  });

  const [ found ] = candidates.filter(match => match.length === base.length - 1);
  if (found) return found;
  return compare(tail);
}

const startTime = Date.now();

(async () => {
  const inputs = await readFile(`${__dirname}/input.txt`);

  const answer = compare(inputs).join('');

  console.log(`answer: ${answer}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
