import Player from './player.js';

export default function createGame() {
    const human = new Player('human');
    const computer = new Player('computer');

    let currentPlayer = human;
    let enemyPlayer = computer;
    let gameOver = false;

    function setupBoards() {

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

    function clearBoard(player) {
        player.gameboard.ships = [];
        player.gameboard.missedAttacks = [];
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