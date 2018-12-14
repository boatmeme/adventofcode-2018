const List = require('./DoublyLinkedList');

let index = 0;
let elf1;
let elf2;

const printList = list => console.log(list.map(r => {
  const score = r.data.score;
  const idx = r.data.index;
  return idx === elf1.data.index ? `(${score})` : idx === elf2.data.index ? `[${score}]` : `${score}`;
}).join(' '));


class Recipe {
  constructor(score, elf, idx) {
    this.score = score;
    this.elf = elf;
    this.index = index++;
  }
}

(async () => {
  let matchString = `793031`;
  let matchStringLength = String(matchString).length;

  const list = new List();

  let recipe1 = new Recipe(3, 1)
  list.append(recipe1);
  elf1 = list.tail;

  let recipe2 = new Recipe(7, 2);
  list.append(recipe2);
  elf2 = list.tail;
  //printList(list);
  let matched = false;
  while (true) {
    const digits = String(elf1.data.score + elf2.data.score).split('').map(i => parseInt(i, 10));
    digits.forEach(d => {
      list.append(new Recipe(d));
    });

    let elf1idx = elf1.data.score + 1;
    let elf2idx = elf2.data.score + 1;
    let nextRecipe;
    while (elf1idx > 0) {
      elf1 = elf1.next;
      if (!elf1) {
        elf1 = list.head;
      }
      elf1idx--;
    }
    while (elf2idx > 0) {
      elf2 = elf2.next;
      if (!elf2) {
        elf2 = list.head;
      }
      elf2idx--;
    }
    //printList(list);
    let node = list.tail;
    const candidate = [];
    for (let i = 0; i < (matchStringLength + digits.length); i++) {
      if (node) {
        candidate.unshift(node.data);
        if (candidate.length > matchStringLength) candidate.pop();
        if (candidate.map(d => d.score).join('') === matchString) {
          matched = candidate[0];
          break;
        }
        node = node.prev;
      }
    }
    if(matched) {
      break;
    };
  }
  console.log(`Answer: ${matched.index}`);
})();
