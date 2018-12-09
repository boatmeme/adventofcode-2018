const DoublyLinkedList = require('./DoublyLinkedList');

const playGame = (numPlayers, lastMarble = 0) => {
  const players = Array(numPlayers).fill(null).map(() => []);

  let board = new DoublyLinkedList();
  board.append(0);
  let playerTurn = -1;

  const getNextPlayer = () => {
    playerTurn++;
    if (playerTurn === players.length) {
      playerTurn = 0;
    }
    return players[playerTurn];
  }

  const getCounterClockwiseMarble = () => {
    board.rotateClockwise(7);
    const deleted = board.pop();
    board.rotateCounterClockwise(1);
    return deleted;
  }

  const playMarble = (marble) => {
    if (marble % 23 !== 0) {
      board.rotateCounterClockwise(1);
      board.append(marble);
    } else {
      const player = players[playerTurn];
      player.push(marble);
      player.push(getCounterClockwiseMarble());
    }
  }

  const printBoard = () => {
    //console.log(`[${playerTurn + 1}] ${board.map((m,i) => m.data ).join(' ')}`)
  }

  let marble = 0;
  do {
    printBoard();
    const player = getNextPlayer();
    marble = marble + 1;
    playMarble(marble);
  } while (marble <= lastMarble);
  printBoard();
  return { board, players, playerTurn };
}


const answer = playGame(466, (71436*100));

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
