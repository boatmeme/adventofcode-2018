const { readFile } = require('../../utils');

const startTime = Date.now();

const parseInteger = n => parseInt(n, 10);

const filterFn = o => o !== null;

const characterRegex = /^.*\s([A-Z])\s.*\s([A-Z])\s.*/;
const inputParser = str => {
  if (!str) return null;
  const match = characterRegex.exec(str);
  return {
    pre: match[1],
    step: match[2],
  }
}

const findItem = (arr, index) => {
  return arr.reduce((acc, item) => {
    if (acc) return acc;
    if (item.index === index) return item;
  }, null);
};

const findCost = (table, index) => {
  return findItem(Object.values(table), index).cost;
};

const buildTable = inputs => {
  const steps = inputs.reduce((acc, { pre, step }) => {
    if (acc.indexOf(pre) < 0) acc = [...acc, pre];
    if (acc.indexOf(step) < 0) acc = [...acc, step];
    return acc;
  }, []).sort();

  const table = steps.reduce((acc, c, i) => {
    return Object.assign(acc, {
      [c]: { index: i, char: c, cost: Array(steps.length).fill(0) }
    })
  }, {});

  inputs.forEach(({ pre, step }) => {
    const row = table[step];
    const preRow = table[pre];
    row.cost[preRow.index] = 1;
  });

  Object.values(table).forEach((item) => {
    for (let i = 0; i < item.cost.length; i++) {
      if (item.cost[i] > 0) {
        const inheritedCosts = findCost(table, i);
        for (let x = 0; x < inheritedCosts.length; x ++) {
          if (inheritedCosts[x] > 0) {
            item.cost[x] = 1;
          }
        }
      }
    }
  });
  return table;
}

const sum = arr => arr.reduce((acc, i) => acc += i, 0);

const getNext = candidates => {
  return candidates.filter(o => {
    return o.ready && !o.finished;
  }).sort()[0];
}

const getSequence = table => {
  const order = [];
  const length = Object.keys(table).length;
  const candidates = Object.values(table);
  const start = candidates.reduce((acc, o) => {
    Object.assign(o, { weight: sum(o.cost)})
    if (o.weight < acc.weight) {
      acc = o;
    }
    return acc;
  }, { weight: Infinity });

  start.ready = true;

  do {
    const o = getNext(candidates);
    o.finished = true;
    order.push(o);

    candidates.forEach((c, x) => {
      const ready = c.cost.reduce((acc, val, index) => {
        if (val > 0 && !candidates[index].finished) return false;
        return acc;
      }, true);
      c.ready = ready;
    });
  } while (order.length < length);
  return order.map(({ char }) => char).join('');
}

(async () => {
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const inputs = unfilteredInputs.filter(filterFn);
  const stateTable = buildTable(inputs);

  const answer = getSequence(stateTable);

  console.log(`answer: ${answer}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
