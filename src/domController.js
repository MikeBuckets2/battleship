export default function domController(game) {
    const playerBoard = document.getElementById('player-board');
    const enemyBoard = document.getElementById('enemy-board');
    const status = document.getElementById('status');

    function renderBoard(gameboard, element, isEnemy = false) {
        element.innerHTML = '';

        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;

                if (isEnemy) {
                    cell.addEventListener('click', () => {
                        game.playTurn([x, y]);
                        update();

                        if (!game.isGameOver()) {
                            game.computerMove();
                            update();
                        }
                    });
                }

                element.appendChild(cell);
            }
        }
    }

    function update() {
        renderBoard(game.human.gameboard, playerBoard);
        renderBoard(game.computer.gameboard, enemyBoard, true);

        if (game.isGameOver()) {
            status.textContent = 'Game Over';
        }
    }

    update();
}