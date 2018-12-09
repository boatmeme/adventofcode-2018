const playGame = (numPlayers, lastMarble = 0) => {
  const players = Array(numPlayers).fill(null).map(() => []);
  const marbles = Array(lastMarble + 1).fill(null).map((o, i) => i);

  let board = [marbles.shift()];
  let current = 0;
  let playerTurn = -1;

  const getNextPlayer = () => {
    playerTurn++;
    if (playerTurn === players.length) {
      playerTurn = 0;
    }
    return players[playerTurn];
  }

  const getNextSlot = () => {
    const length = board.length;
    if (length === 1) return 1;
    const next = current + 2;
    if (next > length) return 1;
    return next;
  }

  const getCounterClockwiseMarble = () => {
    let marbleIdx = current - 7;
    if (marbleIdx < 0) {
      marbleIdx = board.length + marbleIdx;
    }
    const [deleted] = board.splice(marbleIdx, 1);
    current = marbleIdx;
    if (current >= board.length) return 0;
    return deleted;
  }

  const playMarble = (marble, idx) => {
    if (marble % 23 !== 0) {
      board.splice(idx, 0, marble);
      current = idx;
    } else {
      const player = players[playerTurn];
      player.push(marble);
      player.push(getCounterClockwiseMarble());
    }
  }

  const printBoard = () => {
    console.log(`[${playerTurn + 1}] ${board.map((m,i) => current === i ? '(' + m + ')' : m ).join(' ')}`)
  }

  do {
    printBoard();
    const player = getNextPlayer();
    const marble = marbles.shift();
    const nextSlot = getNextSlot();
    playMarble(marble, nextSlot);
  } while (marbles.length > 0);
  printBoard();
  return { board, players, current, playerTurn };
}


const answer = playGame(9, 25);

const sumScores = arr => arr.reduce((acc, n) => n + acc, 0);

const winningElf = answer.players.reduce((acc, elf, i) => {
  const sum = sumScores(elf);
  if (sum > acc.score) return { score: sum, elf: i + 1 };
  return acc;
}, { score: -Infinity, elf: -1})

console.log(winningElf);
/*
9  players; last marble is worth 25 points: high score is 32
10 players; last marble is worth 1618 points: high score is 8317
13 players; last marble is worth 7999 points: high score is 146373
17 players; last marble is worth 1104 points: high score is 2764
21 players; last marble is worth 6111 points: high score is 54718
30 players; last marble is worth 5807 points: high score is 37305

Part 1: 466 players; last marble is worth 71436 points
Answer: 382055
*/
