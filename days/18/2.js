const { readFile } = require('../../utils');

const startTime = Date.now();

const inputParser = str => {
  if (!str) return null;
  return str.split('');
}

const filterFn = o => o !== null;

const wait = timeInMillis => new Promise((resolve, reject) => setTimeout(resolve, timeInMillis));

class Agent {
  constructor(char, piece) {
    this.piece = piece
    this.char = char;
    this.hp = 200;
    this.ap = 3;
  }
  attack(target) {
    target.damage(this.ap);
  }
  damage(ap) {
    this.hp -= ap;
  }
  isAlive() {
    if (this.hp <= 0) return false;
    return true;
  }
  isElf() {
    if (this.char === 'E') return true;
  }
  isGoblin() {
    if (this.char === 'G') return true;
  }
  toString(expanded = false) {
    return expanded ? `${this.char}(${this.hp})` : this.char;
  }
}

class Piece {
  constructor(board, x, y, pChar) {
    this.board = board;
    this.x = x;
    this.y = y;
    this.isOpen = false;
    this.isTree = false;
    this.isLumberyard = false;
    this.setState(pChar);
    this.nextState;
  }
  setState(pChar) {
    switch(pChar) {
      case '#': {
        this.isOpen = false;
        this.isTree = false;
        this.isLumberyard = true;
        this.char = '#';
        break;
      }
      case '|': {
        this.isOpen = false;
        this.isTree = true;
        this.isLumberyard = false;
        this.char = '|';
        break;
      }
      default: {
        this.char = '.';
        this.isOpen = true;
        this.isTree = false;
        this.isLumberyard = false;
        break;
      }
    }
  }
  transitionState() {
    this.setState(this.nextState);
  }
  setNextState() {
    const pieces = this.getAdjacentPieces();
    const trees = pieces.filter(p => p.isTree);
    const lumberyards = pieces.filter(p => p.isLumberyard);
    //console.log(`${this.y}, ${this.x} - ${pieces.length} ${trees.length} ${lumberyards.length}`);
    if (this.isOpen) {
      if (trees.length >= 3) {
        return this.nextState = '|';
      }
      return this.nextState = '.';
    } else if (this.isTree) {
      if (lumberyards.length >= 3) {
        return this.nextState = '#';
      }
      return this.nextState = '|';
    } else if (this.isLumberyard) {
      if (lumberyards.length >= 1 && trees.length >= 1) {
        return this.nextState = '#';
      }
      return this.nextState = '.';
    }
  }
  getAdjacentPieces() {
    const pieces = this.board.pieces;
    const top = pieces[this.y-1] ? pieces[this.y-1][this.x] : undefined;
    const topLeft = pieces[this.y-1] ? pieces[this.y-1][this.x-1] : undefined;
    const topRight = pieces[this.y-1] ? pieces[this.y-1][this.x+1] : undefined;
    const left = pieces[this.y][this.x-1];
    const right = pieces[this.y][this.x+1];
    const bottomLeft = pieces[this.y+1] ? pieces[this.y+1][this.x-1] : undefined;
    const bottomRight = pieces[this.y+1] ? pieces[this.y+1][this.x+1] : undefined;
    const bottom = pieces[this.y+1] ? pieces[this.y+1][this.x] : undefined;
    return [top, left, right, bottom, topLeft, topRight, bottomLeft, bottomRight]
      .filter(p => p);
  }
  toString() {
    return this.char;
  }
  equals(other) {
    return (this.x === other.x) && (this.y === other.y);
  }
}

const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

class Board {
  constructor(arr2d) {
    this.ticks = 0;
    this.pieces = arr2d.map((row, y) => {
      return row.map((p, x) => {
        return new Piece(this, x, y, p);
      });
    });
    this.currentState = this.pieces.reduce((acc, row) => [...acc, row.map(p => p.char) ], []);
    this.prior = [];
  }
  sum() {
    return this.pieces.reduce((acc, row) => {
      return acc + row
        .filter(p => p.agent !== null && p.agent.isAlive())
        .reduce((s, { agent: { hp } }) => s + hp, 0);
    }, 0);
  }
  outcome() {
    const [trees, lumberyards] = this.pieces.reduce((acc, row) => {
      const [trees, lumberyards] = row.reduce((s, p) => {
        if (p.isTree) return [s[0] + 1, s[1]];
        if (p.isLumberyard) return [s[0], s[1] + 1];
        return s;
      }, [0, 0]);
      return [acc[0] + trees, acc[1] + lumberyards];
    }, [0, 0]);
    return trees * lumberyards;
  }
  detectCycle() {
    for (let i = 0; i < this.prior.length; i++) {
      if (arraysEqual(this.currentState, this.prior[i])) return (this.ticks - i);
    }
    return false;
  }
  transition() {
    this.prior.push(this.currentState);
    this.pieces.forEach(row => row.forEach(p => p.transitionState()));
    this.currentState = this.pieces.reduce((acc, row) => [...acc, ...row.map(p => p.char) ], []);
  }
  tick() {
    this.pieces.forEach(row => row.forEach(p => p.setNextState()));
    this.transition();
    this.ticks++;
    return this.detectCycle();
  }
  toString() {
    const str = this.pieces.map((row, y) => {
      return row.map((p, x) => {
        return p.toString();
      }).join('');
    }).join('\n');
    return `${str}\nTicks: ${this.ticks}\n`;
  }
}

(async () => {
  const minutes = 1000000000;
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const arr2d = unfilteredInputs.filter(filterFn);
  const board = new Board(arr2d);
  let cycle;
  while(!(cycle = board.tick())) {

  }
  console.clear();
  let mod = (minutes - board.ticks) % cycle;
  console.log(`mod: ${mod}`);
  console.log(`ticks: ${board.ticks}\n`);
  console.log(`cycle: ${cycle}\n`);
  console.log(`answer: ${board.outcome()}\n`);
  console.log(board.toString());
  console.log('Running out the difference...')
  while(mod > 0) {
    board.tick();
    mod--;
  }
  console.log(board.toString());
  console.log(`ticks: ${board.ticks}`);
  console.log(`answer: ${board.outcome()}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
