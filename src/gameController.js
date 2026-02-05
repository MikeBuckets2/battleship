import Player from './player.js';

export default function createGame() {
  const human = new Player('human');
  const computer = new Player('computer');

  let currentPlayer = human;
  let enemyPlayer = computer;
  let gameOver = false;

  function setupBoards() {
    randomPlacement(human);
    randomPlacement(computer);
  }

  function switchTurns() {
    [currentPlayer, enemyPlayer] = [enemyPlayer, currentPlayer];
  }

  function playTurn(coordinates) {
    if (gameOver) return { valid: false };

    const result = enemyPlayer.gameboard.receiveAttack(coordinates);
    if (!result || result.valid === false) return { valid: false };

    if (enemyPlayer.gameboard.allShipsSunk()) {
      gameOver = true;
      return { valid: true, gameOver: true };
    }

    switchTurns();
    return { valid: true };
  }

  function computerMove() {
    let move;

    do {
      move = [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
      ];
    } while (
      enemyPlayer.gameboard.hasBeenAttacked(move)
    );

    playTurn(move);
  }

  function clearBoard(player) {
    player.gameboard.reset();
  }

  function resetGameState() {
    gameOver = false;
    currentPlayer = human;
    enemyPlayer = computer;
  }

  function randomPlacement(player) {
    clearBoard(player);

    const shipLengths = [3, 2];

    shipLengths.forEach(length => {
      let placed = false;

      while (!placed) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        const horizontal = Math.random() > 0.5;

        const coordinates = [];

        for (let i = 0; i < length; i++) {
          const coord = horizontal ? [x, y + i] : [x + i, y];
          if (coord[0] > 9 || coord[1] > 9) {
            coordinates.length = 0;
            break;
          }
          coordinates.push(coord);
        }

        if (coordinates.length === length) {
          placed = player.gameboard.placeShip(length, coordinates);
        }
      }
    });
  }

  setupBoards();

  return {
    human,
    computer,
    playTurn,
    computerMove,
    randomPlacement,
    resetGameState,
    isGameOver: () => gameOver,
  };
}
