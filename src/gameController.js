import Player from './player.js';

export default function createGame() {
    const human = new Player('human');
    const computer = new Player('computer');

    let currentPlayer = human;
    let enemyPlayer = computer;
    let gameOver = false;

    function setupBoards() {
        human.gameboard.placeShip(3, [[0,0], [0,1], [0,2]]);
        human.gameboard.placeShip(2, [[4,4], [5,4]]);

        computer.gameboard.placeShip(3, [[2,2], [2,3], [2,4]]);
        computer.gameboard.placeShip(2, [[6,6], [6,7]]);
    }

    function switchTurns() {
        [currentPlayer, enemyPlayer] = [enemyPlayer, currentPlayer];
    }

    function playTurn(coordinates) {
        if (gameOver) return;

        enemyPlayer.gameboard.receiveAttack(coordinates);

        if (enemyPlayer.gameboard.allShipsSunk()) {
            gameOver = true;
            return;
        }

        switchTurns();
    }

    function computerMove() {
        let move;

        do {
            move = [
                Math.floor(Math.random() * 10),
                Math.floor(Math.random() * 10),
            ];
        } while (
            enemyPlayer.gameboard.missedAttacks.some(
                ([x, y]) => x === move[0] && y === move[1]
            )
        );

        playTurn(move);
    }

    setupBoards();

    return {
        human, 
        computer, 
        playTurn, 
        computerMove, 
        isGameOver: () => gameOver, 
        getCurrentPlayer: () => currentPlayer,
    };
};