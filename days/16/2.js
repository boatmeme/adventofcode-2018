const { readFile } = require('../../utils');

const startTime = Date.now();

const parseInteger = s => parseInt(s, 10);

const digitRegex = /(\d+)/g;

const inputParser = str => {
  if (!str) return null;
  let match;
  let arr = [];
  while(match = digitRegex.exec(str)) {
    arr.push(parseInteger(match[1]));
  };
  return arr;
}

const inputProgramParser = str => {
  if (!str) return null;
  return str.split(' ').map(parseInteger);
}

const filterFn = o => o !== null;

const buildArr = arr => arr.reduce((acc, o, i) => {
  if (i % 3 === 0) {
    return [...acc, [o]];
  }
  acc[acc.length-1].push(o);
  return acc;
}, []);

const ops = [
  {
    name: 'addr',
    fn: (registers, a, b, c ) => {
      const val = registers[a] + registers[b];
      registers[c] = val;
      return registers;
    }
  },
  {
    name: 'addi',
    fn: (registers, a, b, c ) => {
      const val = registers[a] + b;
      registers[c] = val;
      return registers;
    }
  },
  {
    name: 'mulr',
    fn: (registers, a, b, c ) => {
      const val = registers[a] * registers[b];
      registers[c] = val;
      return registers;
    }
  },
  {
    name: 'muli',
    fn: (registers, a, b, c ) => {
      const val = registers[a] * b;
      registers[c] = val;
      return registers;
    }
  },
  {
    name: 'banr',
    fn: (registers, a, b, c ) => {
      const val = registers[a] & registers[b];
      registers[c] = val;
      return registers;
    }
  },
  {
    name: 'bani',
    fn: (registers, a, b, c ) => {
      const val = registers[a] & b;
      registers[c] = val;
      return registers;
    }
  },
  {
    name: 'borr',
    fn: (registers, a, b, c ) => {
      const val = registers[a] | registers[b];
      registers[c] = val;
      return registers;
    }
  },
  {
    name: 'bori',
    fn: (registers, a, b, c ) => {
      const val = registers[a] | b;
      registers[c] = val;
      return registers;
    }
  },
  {
    name: 'setr',
    fn: (registers, a, b, c ) => {
      const val = registers[a];
      registers[c] = val;
      return registers;
    }
  },
  {
    name: 'seti',
    fn: (registers, a, b, c ) => {
      const val = a;
      registers[c] = val;
      return registers;
    }
  },
  { name: 'gtir', fn: (registers, a, b, c ) => {
    const val = a > registers[b] ? 1 : 0;
    registers[c] = val;
    return registers;
  }},
  {
    name: 'gtri',
    fn: (registers, a, b, c ) => {
      const val = registers[a] > b ? 1 : 0;
      registers[c] = val;
      return registers;
    }
  },
  {
    name: 'gtrr',
    fn: (registers, a, b, c ) => {
      const val = registers[a] > registers[b] ? 1 : 0;
      registers[c] = val;
      return registers;
    }
  },
  {
    name: 'eqir',
    fn: (registers, a, b, c ) => {
      const val = a === registers[b] ? 1 : 0;
      registers[c] = val;
      return registers;
    }
  },
  {
    name: 'eqri',
    fn: (registers, a, b, c ) => {
      const val = registers[a] === b ? 1 : 0;
      registers[c] = val;
      return registers;
    }
  },
  {
    name: 'eqrr',
    fn: (registers, a, b, c ) => {
      const val = registers[a] === registers[b] ? 1 : 0;
      registers[c] = val;
      return registers;
    }
  },
]

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const findCandidates = arr => {
  return arr.map(([registers, inputs, outputs]) => {
    const results = ops.reduce((acc, { name, fn }) => {
      const result = fn.call(this, registers.slice(0), ...inputs.slice(1));
      if (arraysEqual(outputs, result)) {
        acc.push({ name, opcode: inputs[0] });
      }
      return acc;
    }, []);
    return results;
  });
}

const mapOpcodes = arr => {
  const candidates = arr.filter(a => a.length === 1);
  const opcodes = candidates.reduce((acc, a) => {
    const [{ name, opcode }] = a;
    return Object.assign(acc, { [opcode]: ops.filter(o => o.name === name)[0] });
  }, {});
  const next = arr.map(a => {
    return a.filter(b => {
      let match = true;
      Object.values(opcodes).forEach(opcode => {
        // console.log(b.name, opcode.name, opcode.name === b.name);
        if(opcode.name === b.name) {
          match = false;
          return;
        }
      });
      return match;
    });
  }).filter(a => a.length > 0);
  if (next.length > 0) {
    return Object.assign(opcodes, mapOpcodes(next));
  } else {
    return opcodes;
  }
}

const runProgram = (programArr, opMap) => {
  return programArr.reduce((registers, [op, a, b, c]) => {
    const opFn = opMap[op].fn;
    return opFn.call(this, registers, a, b, c);
  }, [0, 0, 0, 0])
}

(async () => {
  // 203025
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const arr = buildArr(unfilteredInputs.filter(filterFn));
  const candidates = findCandidates(arr);
  const opMap = mapOpcodes(candidates);

  const unfilteredProgramInputs = await readFile(`${__dirname}/input2.txt`, inputProgramParser);
  const program = unfilteredProgramInputs.filter(filterFn);
  const answer = runProgram(program, opMap);

  console.log(`answer: ${answer}\n`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
