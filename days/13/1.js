const { readFile } = require('../../utils');

const startTime = Date.now();

const inputParser = str => {
  if (!str) return null;
  return str.split('');
}

const filterFn = o => o !== null;

const wait = timeInMillis => new Promise((resolve, reject) => setTimeout(resolve, timeInMillis));

class Cart {
  constructor(char) {
    this.char = char;
    this.memoryIdx = 0;
    this.memory = [this.left, this.straight, this.right];
  }
  intersection() {
    this.memory[this.memoryIdx].call(this);
    this.memoryIdx += 1;
    if (this.memoryIdx === this.memory.length) {
      this.memoryIdx = 0;
    }
  }
  right() {
    switch(this.char) {
      case '^':
        this.char = '>';
        break;
      case '>':
        this.char = 'v';
        break;
      case 'v':
        this.char = '<';
        break;
      default:
        this.char = '^';
    }
  }
  left() {
    switch(this.char) {
      case '^':
        this.char = '<';
        break;
      case '>':
        this.char = '^';
        break;
      case 'v':
        this.char = '>';
        break;
      default:
        this.char = 'v';
    }
  }
  leftRight() {
    return this.char === '<' || this.char === '>';
  }
  straight() {
    // no-op
  }
  getNextCoordinateOffset() {
    switch(this.char) {
      case '^':
        return [0,-1];
      case '>':
        return [1,0];
      case 'v':
        return [0,1];
      default:
        return [-1,0];
    }
  }
  toString() {
    return this.char;
  }
}

class Piece {
  constructor(x, y, pChar) {
    this.x = x;
    this.y = y;
    this.intersection = false;
    this.cart = null;
    this.collision = false;
    this.isEmpty = false;
    switch(pChar) {
      case ' ': {
        this.empty = true;
        this.char = ' ';
        break;
      }
      case '+': {
        this.intersection = true;
        this.char = '+';
        break;
      }
      case '|': {
        this.char = '|';
        break;
      }
      case '-': {
        this.char = '-';
        break;
      }
      case '/': {
        this.char = '/';
        break;
      }
      case '\\': {
        this.char = '\\';
        break;
      }
      default: {
        if(pChar === '^' || pChar === 'v') {
          this.char = '|';
        } else if (pChar === '>' || pChar === '<') {
          this.char = '-';
        }
        this.putCart(new Cart(pChar));
        break;
      }
    }
  }
  getNextCartCoords() {
    if (!this.cart) throw new Error(`Can't get next cart for unoccupied track`);
    return this.cart.getNextCoordinateOffset();
  }
  putCart(cart) {
    if (this.isEmpty) throw new Error(`Can't derail the cart into an empty track section`);
    if (this.cart) {
      this.collision = true;
      return;
    }
    switch(this.char) {
      case '+':
        cart.intersection();
        break;
      case '/':
        if (cart.leftRight()) {
          cart.left();
          break;
        }
        cart.right();
        break;
      case '\\':
        if (cart.leftRight()) {
          cart.right();
          break;
        }
        cart.left();
        break;
      default:
        break;
    }
    this.cart = cart;
  }
  removeCart() {
    const cart = this.cart;
    this.cart = null;
    return cart;
  }
  toString() {
    return this.collision ? 'X' : (this.cart ? this.cart.toString() : this.char);
  }
}

class Track {
  constructor(arr2d) {
    this.collision = false;
    this.ticks = 0;
    this.pieces = arr2d.map((row, y) => {
      return row.map((p, x) => {
        return new Piece(x, y, p);
      });
    });
  }
  tick() {
    this.ticks++;
    const piecesToMove = this.pieces.reduce((acc, row) => [...acc, ...row.filter(p => p.cart !== null)], []);
    for(let j = 0; j < piecesToMove.length; j++) {
      const piece = piecesToMove[j];
      const [x, y] = piece.getNextCartCoords();
      const cart = piece.removeCart();
      const newX = piece.x + x;
      const newY = piece.y + y;
      const targetPiece = this.pieces[newY][newX];
      targetPiece.putCart(cart);
      if (targetPiece.collision) {
        this.collision = targetPiece;
        return false;
      }
    }
    return true;
  }
  toString() {
    return this.pieces.map((row, y) => {
      return row.map((p, x) => {
        return p.toString();
      }).join('');
    }).join('\n');
  }
}

(async () => {
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const arr2d = unfilteredInputs.filter(filterFn);
  const track = new Track(arr2d);
  while(track.tick()) {
    //console.clear();
    //console.log(`Ticks: ${track.ticks}\n`);
    //console.log(track.toString());
    //await wait(0);
  }
  console.clear();
  console.log(`Ticks: ${track.ticks}\n`);
  console.log(`Collision: ${track.collision.x},${track.collision.y}\n`);

  //console.log(`answer: ${answer}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
