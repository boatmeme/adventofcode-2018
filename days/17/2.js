const { readFile } = require('../../utils');

const startTime = Date.now();

const parseInteger = s => parseInt(s, 10);

const inputParser = str => {
  /*
  x=495, y=2..7
  y=7, x=495..501
  x=501, y=3..7
  x=498, y=2..4
  x=506, y=1..2
  x=498, y=10..13
  x=504, y=10..13
  y=13, x=498..504
  */
  if (!str) return null;
  const [left, right] = str.split(', ');
  const [laxis, lval] = left.split('=');
  const [raxis, rval] = right.split('=');
  const [min, max] = rval.split('..').map(parseInteger);
  coords = [];
  const constant = parseInteger(lval);
  for( let i = min; i <= max; i++ ) {
    if (laxis === 'y') {
      coords.push([constant,i]);
    } else {
      coords.push([i,constant]);
    }
  }
  return coords;
}

const filterFn = o => o !== null;

const wait = timeInMillis => new Promise((resolve, reject) => setTimeout(resolve, timeInMillis));

class Piece {
  constructor(board, x, y, pChar) {
    this.board = board;
    this.x = x;
    this.y = y;
    this.setChar(pChar);
  }
  setChar(pChar) {
    switch(pChar) {
      case '.': {
        this.isEmpty = true;
        this.char = '.';
        break;
      }
      case '#': {
        this.isEmpty = false;
        this.char = '#';
        break;
      }
      case '|': {
        this.isEmpty = true;
        this.char = '|';
        break;
      }
      case '+': {
        this.isEmpty = false;
        this.char = '+';
        break;
      }
      default: {
        this.char = '~';
        this.isEmpty = false;
        break;
      }
    }
  }

  getBottom() {
    return this.board.pieces[this.y+1] ? this.board.pieces[this.y+1][this.x] : undefined;
  }

  getLeft() {
    return this.board.pieces[this.y][this.x-1];
  }

  getRight() {
    return this.board.pieces[this.y][this.x+1];
  }

  getTop() {
    return this.board.pieces[this.y-1] ? this.board.pieces[this.y-1][this.x] : undefined;
  }

  spreadRight() {
    this.setChar('|');
    const right = this.getRight();
    const bottom = this.getBottom();
    if (bottom.isEmpty) return this;
    if (right.isEmpty) return right.spreadRight();
    return false;
  }

  spreadLeft() {
    this.setChar('|');
    const left = this.getLeft();
    const bottom = this.getBottom();
    if (bottom.isEmpty) return this;
    if (left.isEmpty) return left.spreadLeft();
    return false;
  }

  fillRight() {
    this.setChar('~');
    const right = this.getRight();
    if (right.isEmpty) return right.fillRight();
  }

  fillLeft() {
    this.setChar('~');
    const left = this.getLeft();
    if (left.isEmpty) return left.fillLeft();
  }

  down() {
    const bottom = this.getBottom();
    if (!bottom) {
      this.setChar('|');
      return [];
    }
    if (bottom.isEmpty) {
      if (this.char !== '+') {
        this.setChar('|');
      }
      return [bottom];
    } else {
      const leftSource = this.spreadLeft();
      const rightSource = this.spreadRight();
      if (!leftSource && !rightSource) {
        this.fillRight();
        this.fillLeft();
        return [this.getTop()];
      }
      const returns = [];
      if (leftSource) returns.push(leftSource);
      if (rightSource) returns.push(rightSource);
      return returns;
    }
  }

  toString() {
    return this.char;
  }
}

const getMinMax = arr => arr.reduce((acc, [y, x]) => {
    if (y > acc.maxY) acc.maxY = y;
    if (y < acc.minY) acc.minY = y;
    if (x > acc.maxX) acc.maxX = x;
    if (x < acc.minX) acc.minX = x;
    return acc;
  }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

const unique = (value, index, self) => self.indexOf(value) === index;

class Board {
  constructor(clayArray, x, y) {
    this.ticks = 0;
    const { minX, maxX, maxY, minY } = getMinMax(clayArray);
    this.minY = 0;
    this.realMinY = minY
    this.minX = minX-1;
    this.maxX = maxX;
    this.maxY = maxY;

    this.pieces = Array(maxY+1).fill(null).map((o, y) => Array(maxX+1).fill(null).map((o2, x) => {
      return new Piece(this, x, y, '.');
    }));

    this.sources = [this.pieces[y][x]];

    this.pieces[y][x].setChar('+');

    clayArray.forEach(([y, x]) => {
      this.pieces[y][x].setChar('#');
    });
  }

  sum() {
    return this.pieces.reduce((acc, rows) => {
      const sum = rows.filter(p => p.char === '~' && p.y >= this.realMinY).reduce(acc2 => acc2 + 1, 0);
      return acc + sum;
    }, 0);
  }

  tick() {
    const sources = this.sources;

    this.sources = this.sources.reduce((acc, source) => {
      return [...acc, ...source.down()].filter(unique);
    }, []);
    this.ticks++;
    return this.sources.length;
  }
  toString(restrictWindow = true) {
    const minY = restrictWindow ? this.minY : 0;
    const minX = restrictWindow ? this.minX : 0;
    const maxX = this.maxX + 1;
    const maxY = this.maxY;
    const offsetYLength = String(maxY).length;
    const offsetXLength = String(maxX).length;

    let header = '';
    let spaces = '';
    while (spaces.length < offsetYLength) {
      spaces += ' ';
    }
    for (let x = 0; x < offsetXLength; x++) {
      header += `${spaces} `;
      for (let i = minX; i <= maxX; i ++) {
        const chars = String(i).split('');
        while (chars.length < offsetXLength) {
          chars.unshift(' ');
        }
        header += `${chars[x]}`;
      }
      header += '\n';
    }

    const str = this.pieces.map((row, y) => {
      const board = row.map((p, x) => {
        return (y >= minY && y<= maxY && x >= minX && x <= maxX ) ? p.toString() : '';
      }).join('');
      const yStrArr = String(y).split('');
      while (yStrArr.length < offsetYLength) {
        yStrArr.unshift(' ');
      }
      return `${yStrArr.join('')} ${board}`;
    }).join('\n');

    return `${header}${str}\nTicks: ${this.ticks}\nSum:${this.sum()}\n`;
  }
}

(async () => {
  // 203025
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const arr = unfilteredInputs.filter(filterFn).reduce((acc, arr) => [...acc,...arr], []);
  const board = new Board(arr, 500, 0);
  //console.log(board.toString());
  let sourceCount;
  while (sourceCount = board.tick()) {
    /*
    if (board.ticks % 2000 === 0) {
      console.clear();
      console.log(board.toString());
      console.log(board.sources.length);
      await wait(250000);
    }
    */
  }
  console.clear();
  console.log(board.toString());
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
