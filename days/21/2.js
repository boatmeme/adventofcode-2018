const { readFile } = require('../../utils');

console.time('start');
const startTime = Date.now();

const parseInteger = s => parseInt(s, 10);

const inputParser = str => {
  if (!str) return null;
  let match;
  let arr = [];
  return str.split(' ').map((o, i) => i > 0 ? parseInteger(o) : o)
}

const filterFn = o => o !== null;

let instructions = 0;

let set = new Set();
let lastValue = -1;

const ops = {
  'addr': (registers, a, b, c ) => {
    const val = registers[a] + registers[b];
    registers[c] = val;
    return registers;
  },
  'addi': (registers, a, b, c ) => {
    const val = registers[a] + b;
    registers[c] = val;
    return registers;
  },
  'mulr': (registers, a, b, c ) => {
    const val = registers[a] * registers[b];
    registers[c] = val;
    return registers;
  },
  'muli': (registers, a, b, c ) => {
    const val = registers[a] * b;
    registers[c] = val;
    return registers;
  },
  'banr': (registers, a, b, c ) => {
    const val = registers[a] & registers[b];
    registers[c] = val;
    return registers;
  },
  'bani': (registers, a, b, c ) => {
    const val = registers[a] & b;
    registers[c] = val;
    return registers;
  },
  'borr': (registers, a, b, c ) => {
    const val = registers[a] | registers[b];
    registers[c] = val;
    return registers;
  },
  'bori': (registers, a, b, c ) => {
    const val = registers[a] | b;
    registers[c] = val;
    return registers;
  },
  'setr': (registers, a, b, c ) => {
    const val = registers[a];
    registers[c] = val;
    return registers;
  },
  'seti': (registers, a, b, c ) => {
    const val = a;
    registers[c] = val;
    return registers;
  },
  'gtir': (registers, a, b, c ) => {
    const val = a > registers[b] ? 1 : 0;
    registers[c] = val;
    return registers;
  },
  'gtri': (registers, a, b, c ) => {
    const val = registers[a] > b ? 1 : 0;
    registers[c] = val;
    return registers;
  },
  'gtrr': (registers, a, b, c ) => {
    const val = registers[a] > registers[b] ? 1 : 0;
    registers[c] = val;
    return registers;
  },
  'eqir': (registers, a, b, c ) => {
    const val = a === registers[b] ? 1 : 0;
    registers[c] = val;
    return registers;
  },
  'eqri': (registers, a, b, c ) => {
    const val = registers[a] === b ? 1 : 0;
    registers[c] = val;
    return registers;
  },
  'eqrr': (registers, a, b, c ) => {
    // Here's the magic number! Detect the cycle and print the lastValue
    if (a === 3 && b === 0) {
      const v = registers[a];
      if (set.has(v)) {
        console.log(`Ding Ding! Cycled! Answer: ${lastValue}`);
        console.timeEnd('start');
        process.exit(0);
      }
      set.add(v);
      lastValue = v;
    }
    const val = registers[a] === registers[b] ? 1 : 0;
    registers[c] = val;
    return registers;
  },
}

const runProgram = (programArr, opMap) => {
  return programArr.reduce((registers, [op, a, b, c]) => {
    const opFn = opMap[op].fn;
    return opFn.call(this, registers, a, b, c);
  }, [0, 0, 0, 0])
}

class Program {
  constructor(registerCount, programArr, registerZero = 0) {
    this.registers = Array(registerCount).fill(0);
    this.registers[0] = registerZero;
    const [[ipStr, ip], ...program] = programArr;
    this.ipBinding = ip;
    this.program = program;
    this.history = [];
  }

  execute() {
    while (true) {
      const line = this.program[this.registers[this.ipBinding]]
      const [opCode, ...args] = line;
      const op = ops[opCode];
      this.registers = op.call(this, this.registers, ...args);
      const next = this.registers[this.ipBinding] + 1;
      if (next < 0 || next >= this.program.length) {
        return;
      }
      this.registers[this.ipBinding] = next;
    }
  }

  toString() {
    return `ip# ${this.ipBinding}\n[${this.registers.join(', ')}]`;
  }
}

(async () => {
  const unfilteredProgramInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const programArr = unfilteredProgramInputs.filter(filterFn);

  // So, here, I'm just looking for the first repeated value in register 3, when ip val === 28
  // that's the 'eqrr' op. I'm just adding it to a set and the first time it repeats, I exit
  // and print the next-to-last register 3 value recorded. That number represents the longest running, halting
  // starting value for register 0.
  // Runs in a most unfortunate ~11 min
  const program = new Program(6, programArr, 0);
  program.execute();
  console.log(program.toString());
  const answer = instructions;
  console.log(`answer: ${answer}\n`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
