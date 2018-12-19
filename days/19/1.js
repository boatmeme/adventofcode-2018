const { readFile } = require('../../utils');

const startTime = Date.now();

const parseInteger = s => parseInt(s, 10);

const inputParser = str => {
  if (!str) return null;
  let match;
  let arr = [];
  return str.split(' ').map((o, i) => i > 0 ? parseInteger(o) : o)
}

const filterFn = o => o !== null;

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
  constructor(registerCount, programArr) {
    this.registers = Array(registerCount).fill(0);
    const [[ipStr, ip], ...program] = programArr;
    this.ipBinding = ip;
    this.program = program;
    this.history = [];
  }

  execute() {
    while (true) {
      const line = this.program[this.registers[this.ipBinding]]
      this.history.push(this.registers);
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
  const program = new Program(6, programArr);
  program.execute();
  console.log(program.toString());
  //const answer = runProgram(program, opMap);

  //console.log(`answer: ${answer}\n`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
