const { readFile } = require('../../utils');

const startTime = Date.now();

const { astar, Graph } = require('./Astar');

const inputParser = str => {
  if (!str) return null;
  return str.split('');
}

const filterFn = o => o !== null;

const wait = timeInMillis => new Promise((resolve, reject) => setTimeout(resolve, timeInMillis));

class Agent {
  constructor(char, piece, ap = 3) {
    this.piece = piece
    this.char = char;
    this.hp = 200;
    this.ap = ap;
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
  constructor(board, x, y, pChar, ap = 3) {
    this.board = board;
    this.x = x;
    this.y = y;
    this.agent = null;
    this.isWall = false;
    this.isEmpty = false;
    switch(pChar) {
      case '.': {
        this.isEmpty = true;
        this.char = '.';
        break;
      }
      case '#': {
        this.isWall = true;
        this.isEmpty = false;
        this.char = '#';
        break;
      }
      default: {
        this.char = '.';
        this.putAgent(new Agent(pChar, this, ap))
        break;
      }
    }
  }
  getAdjacentPieces() {
    const pieces = this.board.pieces;
    const top = pieces[this.y-1] ? pieces[this.y-1][this.x] : undefined;
    const left = pieces[this.y][this.x-1];
    const right = pieces[this.y][this.x+1];
    const bottom = pieces[this.y+1] ? pieces[this.y+1][this.x] : undefined;
    return [top, left, right, bottom].filter(p => p && !p.isWall && !p.agent);
  }
  putAgent(agent) {
    if (this.isWall) throw new Error(`Can't place an Agent on a Wall piece`);
    if (this.agent) throw new Error(`Can't place an Agent on an Occupied piece`);
    this.isEmpty = false;
    this.agent = agent;
    this.agent.piece = this;
  }
  removeAgent() {
    const agent = this.agent;
    this.agent = null;
    this.isEmpty = true;
    agent.piece = null;
    return agent;
  }
  toString() {
    return this.agent ? this.agent.toString() : this.char;
  }
  equals(other) {
    return (this.x === other.x) && (this.y === other.y);
  }
}

class Board {
  constructor(arr2d, ap = 3) {
    this.ticks = 0;
    this.pieces = arr2d.map((row, y) => {
      return row.map((p, x) => {
        return new Piece(this, x, y, p, p === 'E' ? ap : 3);
      });
    });
    const { elves, goblins } = this.getAgents();
    this.elfCount = elves.length;
    this.goblinCount = goblins.length;
  }
  transpose() {
    return this.pieces[0].map((x,i) => this.pieces.map(y => y[i].isEmpty ? 1 : 0));
  }
  getGraph() {
    return new Graph(this.transpose());
  }
  sum() {
    return this.pieces.reduce((acc, row) => {
      return acc + row
        .filter(p => p.agent !== null && p.agent.isAlive())
        .reduce((s, { agent: { hp } }) => s + hp, 0);
    }, 0);
  }
  outcome() {
    return this.ticks * this.sum();
  }
  getAgents() {
    return this.pieces.reduce(
      (acc, row) => {
        const agents = row.filter(p => p.agent !== null).map(({ agent }) => agent);
        return {
          agents: [...acc.agents, ...agents],
          elves: [...acc.elves, ...agents.filter(a => a.isElf())],
          goblins: [...acc.goblins, ...agents.filter(a => a.isGoblin())],
        }
      },
      { agents: [], elves: [], goblins: [] });
  }
  tick() {
    const { agents, elves, goblins } = this.getAgents();

    for(let j = 0; j < agents.length; j++) {
      const graph = this.getGraph();
      const agent = agents[j];
      if (!agent.isAlive()) continue;
      const piece = agent.piece;
      const adversaries = (agent.isElf() ? goblins : elves).filter(a => a.isAlive());
      if (adversaries.length === 0) {
        return false;
      }

      let target = adversaries.reduce((acc, a) => {
        const d = Math.abs(a.piece.x - piece.x) + Math.abs(a.piece.y - piece.y);
        if (d === 1) {
          if (!acc || a.hp < acc.hp) {
            return a;
          }
        }
        return acc;
      }, null);

      // ATTACK
      if (target) {
        agent.attack(target);
        if (!target.isAlive()) {
          target.piece.removeAgent();
        }
      // MOVE
      } else {
        const ranges = adversaries.reduce((acc, a) => {
          if (a.isAlive()) {
            return [...acc, ...a.piece.getAdjacentPieces()]
          }
          return acc;
        }, []);
        const start = graph.grid[piece.x][piece.y];
        const { nextMove } = ranges.reduce((acc, p) => {
          const end = graph.grid[p.x][p.y];
          const path = astar.search(graph, start, end, { heuristic: () => 0 });
          const length = path.length;
          if (path.length > 0 && length < acc.minLength) {
            const { x, y } = path[0];
            return { nextMove: [ y, x ], minLength: length };
          }
          return acc;
        }, { nextMove: [], minLength: Infinity });
        if ( nextMove.length === 2) {
          piece.removeAgent();
          this.pieces[nextMove[0]][nextMove[1]].putAgent(agent);

          let target = adversaries.reduce((acc, a) => {
            const d = Math.abs(a.piece.x - agent.piece.x) + Math.abs(a.piece.y - agent.piece.y);
            if (d === 1) {
              if (!acc || a.hp < acc.hp) {
                return a;
              }
            }
            return acc;
          }, null);

          // ATTACK
          if (target) {
            agent.attack(target);
            if (!target.isAlive()) {
              target.piece.removeAgent();
            }
          // MOVE
          }
        }
      }
    }
    this.ticks++;
    return true;
  }
  toString() {
    const str = this.pieces.map((row, y) => {
      const board = row.map((p, x) => {
        return p.toString();
      }).join('');
      const agents = row.filter(p => p.agent).map(({ agent }) => agent.toString(true)).join(', ');
      return `${board}    ${agents}`;
    }).join('\n');
    return `${str}\nTicks: ${this.ticks}\n`;
  }
}

(async () => {
  // 203025
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const arr2d = unfilteredInputs.filter(filterFn);

  let ap = 4;
  let board;
  while (true) {
    board = new Board(arr2d, ap);
    while(board.tick()) {
      //console.clear();
      //console.log(board.toString());
      //await wait(1000);
    }
    const { elves } = board.getAgents();
    if (board.elfCount === elves.length) {
      break;
    }
    ap++;
    //console.clear();
  }
  console.log(board.toString());
  console.log(`sum: ${board.sum()}`)
  console.log(`answer: ${board.outcome()}\n`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
