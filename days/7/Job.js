const defaultCostTax = 60;

const caps = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

const findCost = char => {
  // console.log(`*******Don't forget to change the damned time cost to +60`)
  return caps.indexOf(char) + 1;
}

const sum = arr => arr.reduce((acc, i) => acc += i, 0);

const sortTasks = (a, b) => {
  return a.char.localeCompare(b.char);
}

const buildSteps = (stepsArr, costTax = defaultCostTax) => {
  //console.log(stepsArr)
  const steps = stepsArr.reduce((acc, item) => {
      if (!item) return acc;
      const { pre, step } = item;
      const parent = (acc[pre] || new Step(pre, costTax));
      const child = (acc[step] || new Step(step, costTax));
      parent.addChild(child);
      child.addParent(parent);
      acc[pre] = parent;
      acc[step] = child;
      return acc;
  }, {});
  return Object.values(steps).filter(step => step.parents.length === 0);
}

class Step {
  constructor(char, costTax = defaultCostTax) {
    this.char = char;
    this.cost = findCost(char) + costTax;
    this.timeRemaining = this.cost;
    this.parents = [];
    this.children = [];
    this.started = -1;
    this.finished = false;
  }

  addChild(step) {
    this.children.push(step);
  }
  addParent(step) {
    this.parents.push(step);
  }
  tick() {
    this.timeRemaining--;
    //console.log(`${this.char}: ${this.timeRemaining}`);
    if (this.timeRemaining === 0) {
      this.finished = this.cost + this.started;
    }
  }
}

class Worker {
  constructor(id) {
    this.id = id;
    this.busy = false;
  }

  start(task, tick) {
    this.busy = task;
    task.started = tick;
  }

  tick() {
    if (this.busy) {
      this.busy.tick();
    }
    if (this.busy.finished) {
      this.busy = false;
    }
  }
}

class Job {
  constructor(stepsArr, workers = 1, costTax = defaultCostTax) {
    this.queue = buildSteps(stepsArr, costTax).sort(sortTasks);
    this.inProgress = [];
    this.finished = [];
    this.workers = Array(workers).fill(null).map((o, i) => new Worker(i));
    this.second = -1;
  }
  start() {
    while (!this.isComplete()) {
      this.assignWork();
      this.tick();
    }
    this.second++;
  }
  isComplete() {
    return this.queue.length === 0 && this.inProgress.length === 0;
  }
  getWorker() {
    const available = this.workers.filter(w => !w.busy);
    if (available.length > 0) return available[0];
  }
  tick () {
    this.second++;
    this.workers.forEach(w => w.tick());
    this.finishWork();
  }
  assignWork() {
    let worker;
    let task;

    do {
      worker = this.getWorker();
      if (worker) {
        task = this.queue.shift();
        if (task) {
          this.inProgress.push(task);
          worker.start(task, this.second);
        }
      }
    } while (worker && task);
  }
  finishWork() {
    const done = this.inProgress.filter(w => w.finished);
    this.inProgress = this.inProgress.filter(w => !w.finished);

    done.forEach(d => {
      this.finished.push(d);
      for (let i = 0; i < d.children.length; i ++) {
        const child = d.children[i];
        if (this.queue.indexOf(child) < 0) {
          const notFinished = child.parents.filter(p => !p.finished);
          if (notFinished.length === 0) this.queue.push(child);
        }
      }
    });
    this.queue = this.queue.sort(sortTasks);
  }
  toString() {
    const queue = this.queue.map(c => c.char).join(', ');
    const inProgress = this.inProgress.map(c => c.char).join(', ');
    const finished = this.finished.map(c => c.char).join(', ');
    return `queue: ${queue}\ninProgress: ${inProgress}\nfinished: ${finished}\nsecond: ${this.second}`;
  }
}

module.exports = Job;
