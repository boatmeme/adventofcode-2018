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

let instructions = 0;

const incr = (...args) => {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === 0) {
      //console.log(logline);
      //console.log(`after ${instructions} lines executed`);
    }
  }
  instructions++;
}

const ops = {
  'addr': (registers, a, b, c ) => {
    const val = registers[a] + registers[b];
    registers[c] = val;
    incr(a, b);
    return registers;
  },
  'addi': (registers, a, b, c ) => {
    const val = registers[a] + b;
    registers[c] = val;
    incr(a, c);
    return registers;
  },
  'mulr': (registers, a, b, c ) => {
    const val = registers[a] * registers[b];
    registers[c] = val;
    incr(a, b, c);
    return registers;
  },
  'muli': (registers, a, b, c ) => {
    const val = registers[a] * b;
    registers[c] = val;
    incr(a, c);
    return registers;
  },
  'banr': (registers, a, b, c ) => {
    const val = registers[a] & registers[b];
    registers[c] = val;
    incr(a, b, c);
    return registers;
  },
  'bani': (registers, a, b, c ) => {
    const val = registers[a] & b;
    registers[c] = val;
    incr(a, c);
    return registers;
  },
  'borr': (registers, a, b, c ) => {
    const val = registers[a] | registers[b];
    registers[c] = val;
    incr(a, b, c);
    return registers;
  },
  'bori': (registers, a, b, c ) => {
    const val = registers[a] | b;
    registers[c] = val;
    incr(a, c);
    return registers;
  },
  'setr': (registers, a, b, c ) => {
    const val = registers[a];
    registers[c] = val;
    incr(a, c);
    return registers;
  },
  'seti': (registers, a, b, c ) => {
    const val = a;
    registers[c] = val;
    incr(c);
    return registers;
  },
  'gtir': (registers, a, b, c ) => {
    const val = a > registers[b] ? 1 : 0;
    registers[c] = val;
    incr(b, c);
    return registers;
  },
  'gtri': (registers, a, b, c ) => {
    const val = registers[a] > b ? 1 : 0;
    registers[c] = val;
    incr(a, c);
    return registers;
  },
  'gtrr': (registers, a, b, c ) => {
    const val = registers[a] > registers[b] ? 1 : 0;
    registers[c] = val;
    incr(a, b, c);
    return registers;
  },
  'eqir': (registers, a, b, c ) => {
    const val = a === registers[b] ? 1 : 0;
    registers[c] = val;
    incr(b, c);
    return registers;
  },
  'eqri': (registers, a, b, c ) => {
    const val = registers[a] === b ? 1 : 0;
    registers[c] = val;
    incr(a, c);
    return registers;
  },
  'eqrr': (registers, a, b, c ) => {
    const val = registers[a] === registers[b] ? 1 : 0;
    registers[c] = val;
    incr(a, b, c);
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

  // Employed line logging every time an instruction is executed to find where register zero was being
  // used. It was being used on the eqrr operation (whenever ip value was 28) to check if it was equal
  // to the value of register 3. Took the first value of register 3 (16311888) and started with register zero equal
  // to 16311888. This caused the program to halt after 1848 instructions executed.
  // * This happened to be the correct answer, but I'm still not sure what the computation is doing
  const program = new Program(6, programArr, 16311888);
  program.execute();
  console.log(program.toString());
  const answer = instructions;
  console.log(`answer: ${answer}\n`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
