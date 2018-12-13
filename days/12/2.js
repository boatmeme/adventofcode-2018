const { readFile } = require('../../utils');
const LinkedList = require('./DoublyLinkedList');
const Pot = require('./Pot');

const startTime = Date.now();

const stateRegex = /^initial state:\s(.*)/;

const generations = 20;

const inputParser = str => {
  if (!str) return null;
  const stateMatch = stateRegex.exec(str);
  if (stateMatch) {
    const state = new LinkedList();
    stateMatch[1].split('').forEach((s, i) => state.append(new Pot(i, s)));
    return state;
  }
  const [params, result] = str.split(' => ');
  return [params.split(''), result];
}

const filterFn = o => o !== null;

const getStateString = arr => arr.map(({ data: p }) => p.toString()).join('');

const printState = arr => {
  console.log(getStateString(arr));
}

const printStateAnnotated = arr => {
  console.log(arr.map(({ data: p }) => ` ${p.index} (${p.toString()})`).join(''));
}

const sum = state => state
  .map(({ data }) => data)
  .filter(({ state, index }) => state === '#' ? true : false)
  .reduce((acc,{ index }) => acc + index, 0);

const startTrim = /^\.*/;
const endTrim = /\.*$/;
const getPattern = state => getStateString(state).replace(startTrim, '').replace(endTrim, '');

(async () => {
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const [state, ...steps] = unfilteredInputs.filter(filterFn);

  const generations = 50000000000;

  let lastPattern = '';
  let i;

  for (i = 0; i < generations; i++) {
    const head = state.head;
    const tail = state.tail;

    const pattern = getPattern(state);
    if (pattern === lastPattern) {
      break;
    }
    lastPattern = pattern;
    if (head.data.state === '#') {
      state.appendAt(0, new Pot(head.data.index - 1))
      state.appendAt(0, new Pot(head.data.index - 2))
      state.appendAt(0, new Pot(head.data.index - 3))
    } else if (head.next.data.state === '#') {
      state.appendAt(0, new Pot(head.data.index - 1))
      state.appendAt(0, new Pot(head.data.index - 2))
    } else if (head.next.next.data.state === '#') {
      state.appendAt(0, new Pot(head.data.index - 1))
    }

    if (tail.data.state === '#') {
      state.append(new Pot(tail.data.index + 1))
      state.append(new Pot(tail.data.index + 2))
      state.append(new Pot(tail.data.index + 3))
    } else if (tail.prev.data.state === '#') {
      state.append(new Pot(tail.data.index + 1))
      state.append(new Pot(tail.data.index + 2))
    } else if (tail.prev.prev.data.state === '#') {
      state.append(new Pot(tail.data.index + 1))
    }
    //printState(state);

    steps.forEach(([steps, result]) => {
      const [minus2Val, minus1Val, meVal, plus1Val, plus2Val] = steps;
      state.traverse((me) => {
        if (me.prev && me.prev.prev && me.next && me.next.next) {
          const minus2 = me.prev.prev.data.state;
          const minus1 = me.prev.data.state;
          const zero = me.data.state;
          const plus1 = me.next.data.state;
          const plus2 = me.next.next.data.state;
          if (minus2 === minus2Val &&
            minus1 === minus1Val &&
            zero === meVal &&
            plus1 === plus1Val &&
            plus2 === plus2Val)
          {
            me.data.setNextState(result);
          }
        }
      });
    });
    state.traverse((me) => {
      me.data.transition();
    });
}
  const add = generations - i;
  state.traverse((me) => {
    me.data.index += add;
  });
  const answer = sum(state);
  console.log(`answer: ${answer}`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
