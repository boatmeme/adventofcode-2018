const { readFile } = require('../../utils');

const startTime = Date.now();

const parseInteger = s => parseInt(s, 10);

const Teams = {
  IMMUNE_SYSTEM: 'Immune System',
  INFECTION: 'Infection',
}

const Damage = {
  FIRE: 'fire',
  SLASHING: 'slashing',
  COLD: 'cold',
  BLUDGEONING: 'bludgeoning',
  RADIATION: 'radiation',
}

const PROP_MAPS = [
  { regex: /^(\d*)/,
    prop: 'units',
    transform: ([_, n]) => parseInteger(n) },
  { regex: /(\d*) hit points/,
    prop: 'hp',
    transform: ([_, n]) => parseInteger(n) },
  { regex: /with an attack that does (\d*) (\S*)/,
    prop: 'attack',
    transform: ([_, damage, type]) => ({ damage: parseInteger(damage), type }),
  },
  { regex: /at initiative (\d*)/,
    prop: 'initiative',
    transform: ([_, initiative]) => parseInteger(initiative),
  },
  { regex: /immune to (.*?)[;)]/,
    prop: 'immunities',
    transform: ([_, str]) => str.split(', '),
  },
  { regex: /weak to (.*?)[;)]/,
    prop: 'weaknesses',
    transform: ([_, str]) => str.split(', '),
  },
];

let teamState;

const inputParser = str => {
  if (!str) return null;
  if (str === 'Immune System:') {
    teamState = Teams.IMMUNE_SYSTEM;
    return null;
  }
  if (str === 'Infection:') {
    teamState = Teams.INFECTION;
    return null;
  }
  return PROP_MAPS.reduce((acc, { regex, prop, transform }) => {
    const match = regex.exec(str);
    if (match) {
      Object.assign(acc, { [prop]: transform(match) });
    }
    return acc;
  }, { team: teamState });
}

const filterFn = o => o !== null;

const wait = timeInMillis => new Promise((resolve, reject) => setTimeout(resolve, timeInMillis));

class Group {
  constructor(o) {
    Object.assign(this, o);
  }
  getEffectivePower() {
    return this.units * this.attack.damage;
  }
  isAlive() {
    if (this.units <= 0) return false;
    return true;
  }

  hasImmunity(type) {
    if (!this.immunities) return false;
    for (let i = 0; i < this.immunities.length; i++) {
      if (this.immunities[i] === type) return true;
    }
    return false;
  }

  hasWeakness(type) {
    if (!this.weaknesses) return false;
    for (let i = 0; i < this.weaknesses.length; i++) {
      if (this.weaknesses[i] === type) return true;
    }
    return false;
  }

  calculateDamage(attacker) {
    let multiplier = 1;
    const ep = attacker.getEffectivePower();
    if (this.hasWeakness(attacker.attack.type)) {
      multiplier += 1;
    } else if (this.hasImmunity(attacker.attack.type)) {
      multiplier -= 1;
    }
    return multiplier * ep;
  }

  queueAttack(attacker) {
    this.targeted = attacker;
  }

  transition() {
    const attacker = this.targeted;
    if (!attacker || !attacker.isAlive()) return;
    const damage = this.calculateDamage(attacker);
    const units = Math.max(0, this.units - Math.floor(damage / this.hp));
    Object.assign(this, {
      units,
      targeted: false
    });
  }

  targetGroup(target) {
    this.target = target;
    this.target.queueAttack(this);
  }

  executeAttack() {
    //console.log(`${this.toString()} attacking ${this.target.toString()}`)
    if (this.target && this.isAlive() && this.target.isAlive()) {
      this.target.transition();
      this.target = false;
    }
  }

  toString(expanded = false) {
    let str = `${this.units} units each with ${this.hp} hit points`;
    if (this.immunities) {
      str += ` (immune to ${this.immunities.join(', ')}`;
      if (this.weaknesses) str += '; ';
    }
    if (this.weaknesses) {
      if (!this.immunities) str += ' (';
      str += `weak to ${this.weaknesses.join(', ')}`;
    }
    if (this.immunities || this.weaknesses) str += ')';
    str += ` with an attack that does ${this.attack.damage} ${this.attack.type} damage`;
    str += ` at initiative ${this.initiative}`;
    return str;
  }
}

const initiativeSort = (a, b) => {
  if (a.initiative < b.initiative) {
    return 1;
  }
  if (a.initiative > b.initiative) {
    return -1;
  }
  return 0;
}

const effectivePowerSort = (a, b) => {
  if (a.getEffectivePower() < b.getEffectivePower()) {
    return 1;
  }
  if (a.getEffectivePower() > b.getEffectivePower()) {
    return -1;
  }
  return 0;
}

const damageSort = (a, b, c) => {
  if (a.calculateDamage(c) < b.calculateDamage(c)) {
    return 1;
  }
  if (a.calculateDamage(c) > b.calculateDamage(c)) {
    return -1;
  }
  return 0;
}

const groupSelectionSort = (a, b) => {
  const byEffectivePower = effectivePowerSort(a, b);
  if (byEffectivePower === 0) return initiativeSort(a, b);
  return byEffectivePower;
}

const targetSelectionSort = (attacker) => (a, b) => {
  const byDamage = damageSort(a, b, attacker);
  if (byDamage === 0) return groupSelectionSort(a, b);
  return byDamage;
}

class Board {
  constructor(arr) {
    this.GROUPS = arr.map(g => new Group(g));
    this.ticks = 0;
  }

  tick() {
    const activeGroups = this.GROUPS.filter(g => g.isAlive());
    const IMMUNE_SYSTEM = activeGroups.filter(g => g.team === Teams.IMMUNE_SYSTEM);
    const INFECTIONS = activeGroups.filter(g => g.team === Teams.INFECTION);

    if (IMMUNE_SYSTEM.length === 0) {
      this.winner = Teams.INFECTION;
      this.winnerUnits = INFECTIONS.reduce((acc, g) => acc + g.units, 0);
      return false;
    } else if (INFECTIONS.length === 0) {
      this.winner = Teams.IMMUNE_SYSTEM;
      this.winnerUnits = IMMUNE_SYSTEM.reduce((acc, g) => acc + g.units, 0);
      return false;
    }

    activeGroups.sort(groupSelectionSort).forEach(attackingGroup => {
      const ENEMIES = attackingGroup.team === Teams.IMMUNE_SYSTEM ? INFECTIONS : IMMUNE_SYSTEM;
      const candidates = ENEMIES.filter(g => !g.targeted).sort(targetSelectionSort(attackingGroup));

      if (candidates.length === 0) return;
      const target = candidates[0];
      if (target.calculateDamage(attackingGroup) === 0) return;
      attackingGroup.targetGroup(target);
    });

    activeGroups.sort(initiativeSort).forEach(group => group.executeAttack());
    return ++this.ticks;
  }
  toString() {
    let str = `--- Turn #${this.ticks} ---\nImmune System:\n`;
    str += this.GROUPS.filter(g => g.team === Teams.IMMUNE_SYSTEM).reduce((s, g, i) => `${s}Group ${i+1} contains ${g.units} units\n`, '');
    str += `\nInfection:\n`
    str += this.GROUPS.filter(g => g.team === Teams.INFECTION).reduce((s, g, i) => `${s}Group ${i+1} contains ${g.units} units\n`, '');
    return str;
  }
}

(async () => {
  const minutes = 10;
  const unfilteredInputs = await readFile(`${__dirname}/input.txt`, inputParser);
  const arr = unfilteredInputs.filter(filterFn);
  const board = new Board(arr);

  while(board.tick()) {
    console.clear();
    console.log(board.toString());
  }

  console.clear();
  console.log(board.toString());
  console.log(`Winner: ${board.winner}\n`);
  console.log(`Units Remaining: ${board.winnerUnits}\n`);
  console.log(`after ${(Date.now() - startTime) / 1000} seconds`);
})();
