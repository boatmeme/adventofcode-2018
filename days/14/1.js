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
  let afterRecipes = 793031;
  let numRecipesAfter = 10;
  let maxIdx = afterRecipes + numRecipesAfter;

  const list = new List();

  let recipe1 = new Recipe(3, 1)
  list.append(recipe1);
  elf1 = list.tail;

  let recipe2 = new Recipe(7, 2);
  list.append(recipe2);
  elf2 = list.tail;
  //printList(list);

  while (index <= maxIdx) {
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
  }
  list.rotateCounterClockwise(afterRecipes);
  let node = list.head;
  let answer = [];
  for (let i = 0; i < numRecipesAfter; i++) {
    answer.push(node.data.score);
    node = node.next;
  }
  console.log(`Answer: ${answer.join('')}`);
})();
