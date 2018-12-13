class Pot {
  constructor(index, state = '.') {
    this.index = index;
    this.state = state;
    this.nextState = '.';
  }

  setNextState(state) {
    this.nextState = state;
  }
  transition() {
    this.state = this.nextState;
    this.nextState = '.'
  }
  toString() {
    return this.state;
  }
  idToString() {
    return `${this.index}`;
  }
}
module.exports = Pot;
