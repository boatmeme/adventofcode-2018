const { readFile } = require('../../utils');

const startTime = Date.now();

const caps = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

const isCap = a => {
  if (caps.indexOf(a) >= 0) return true;
  return false;
}

const isOpposite = (a, b) => {
  if (a.toLowerCase() !== b.toLowerCase()) return false;
  if (isCap(a) && !isCap(b)) return true;
  if (!isCap(a) && isCap(b)) return true;
  return false;
};

const unzipArrs = inputStr => {
  const evens = [];
  const odds = [];
  for (let i = 0; i < inputStr.length; i++) {
    if (i % 2 === 0) evens.push(inputStr[i]);
    else odds.push(inputStr[i]);
  }
  return [evens, odds];
}

const solvePuzzle = inputStr => {
  let inputChars = inputStr.split('');
  for (let i = 0; i < inputChars.length - 1; i++) {
    const a = inputChars[i];
    const b = inputChars[i+1];
    if (isOpposite(a, b)) {
        inputChars.splice(i, 2);
        i = 0;
    }
  }
  return inputChars.join('');
}

(async () => {
  const [ inputStr ] = await readFile(`${__dirname}/input.txt`);
  const answer = solvePuzzle(solvePuzzle(inputStr));

  console.log(`answer: ${answer.length}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
