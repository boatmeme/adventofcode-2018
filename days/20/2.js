const { readFile } = require('../../utils');

const startTime = Date.now();

const contentRegex = /\^(.*)\$/g;

const inputParser = str => {
  if (!str) return null;
  const match = contentRegex.exec(str);
  const fullPattern = match[1];
  return new Path([ X, ...fullPattern.split('')]);
}

const openChar = '(';
const closeChar = ')';
const orChar = '|';
const N = 'N';
const S = 'S';
const W = 'W';
const E = 'E';
const X = 'X';

const splitOnOr = arr => {
  let openParens = 0;
  let splitIndices = [];
  for (let i = 0; i < arr.length; i++) {
    const char = arr[i];
    if (char === openChar) {
      openParens++;
    } else if (char === closeChar) {
      openParens--;
    } else if (char === orChar && openParens === 1) {
      splitIndices.push(i);
    }
  }
  let returnArr = [];
  let x = 1;
  for (let i = 0; i < splitIndices.length; i ++) {
    const index = splitIndices[i];
    returnArr.push(arr.slice(x, index));
    x = index + 1;
  }
  returnArr.push(arr.slice(splitIndices[splitIndices.length-1] + 1, arr.length - 1));
  return returnArr.filter(arr => arr.length > 0);
}

const splitBranch = arr => {
  let openParens = 0;
  let splitIndices = [];
  for (let i = 0; i < arr.length; i++) {
    const char = arr[i];
    if (char === openChar) {
      openParens++;
    } else if (char === closeChar) {
      openParens--;
      if (openParens === 0) {
        splitIndices.push(i);
      }
    } else if (openParens === 0) {
      break;
    }
  }
  let returnArr = [];
  let x = 0;
  for (let i = 0; i < splitIndices.length; i ++) {
    const index = splitIndices[i];
    returnArr.push(arr.slice(x, index+1));
    x = index + 1;
  }
  returnArr.push(arr.slice(splitIndices[splitIndices.length-1] + 1));
  return returnArr.filter(arr => arr.length > 0);
}

const uniquePaths = arr => arr.reduce((a, o) => {
  for (let x = 0; x < a.length; x++) {
    if(a[x].coords[0] === o.coords[0] && a[x].coords[1] === o.coords[1]) {
      return a;
    }
  }
  return [...a, o];
}, []);

class Path {
  constructor(strArr, fromCoords = [0, 0]) {
    const [char, ...rest] = strArr;
    this.char = char;
    this.coords = this.calcCoords(fromCoords);
    this.children = [];
    this.buildChildren(rest);
  }
  calcCoords([y, x]) {
    if (this.char === N) {
      return [y-1, x];
    } else if (this.char === S) {
      return [y+1, x];
    } else if (this.char === E) {
      return [y, x+1];
    } else if (this.char === W) {
      return [y, x-1];
    } else {
      return [0, 0];
    }
  }
  buildChildren(strArr) {
    if(strArr[0] === openChar) {
      const childStrs = splitBranch(strArr);
      this.children = [...this.children, ...childStrs.reduce((acc, s) => {
        if (s[0] === openChar) {
          return [...acc, ...splitOnOr(s).filter(arr => arr.length > 0).map(a => {
            return new Path(a, this.coords);
          })];
        }
        return [...acc, new Path(s, this.coords)];
      }, [])]
    } else if (strArr[0] && strArr[0] !== closeChar) {
      this.children.push(new Path(strArr, this.coords));
    }
  }
  flatten() {
    return [this, ...this.children.reduce((acc, c) => [...acc, ...c.flatten()], [])];
  }
  walk (coords, count = 0) {
    if (this.coords[0] === coords[0] && this.coords[1] === coords[1]) return [count];
    return this.children.reduce((acc, c) => {
     return [...acc, ...c.walk(coords, count + 1)];
    }, []);
  }
}

const filterFn = o => o !== null;

const wait = timeInMillis => new Promise((resolve, reject) => setTimeout(resolve, timeInMillis));

const calcFurthestShortPath = (path, num) => {
  const flatPaths = path.flatten();
  console.log(`all paths: ${flatPaths.length}`);
  const unique = uniquePaths(flatPaths);
  console.log(`unique paths: ${unique.length}`);

  return unique.reduce((sum, p) => {
    const candidates = path.walk(p.coords);
    const min = candidates.reduce((acc, n) => n < acc ? n : acc, Infinity);
    return min >= num ? sum + 1 : sum;
  }, 0);
}

(async () => {
  console.log(`Note, I ran this with 'node --stack-size=16000 1.js'`);
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const path = unfilteredInputs.filter(filterFn)[0];

  const answer = calcFurthestShortPath(path, 1000);
  console.log(`answer: ${answer}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
