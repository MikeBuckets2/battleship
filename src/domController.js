export default function domController(game) {
    const playerBoard = document.getElementById('player-board');
    const enemyBoard = document.getElementById('enemy-board');
    const status = document.getElementById('status');
    const randomizeBtn = document.getElementById('randomize');

    function renderBoard(gameboard, element, isEnemy = false) {
        element.innerHTML = '';

        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;

                const shipHit = gameboard.ships.some(obj => 
                    obj.coordinates.some(
                        c => 
                            c[0] === x && 
                        c[1] === y && 
                        obj.ship.hits > 0
                    )
                );

                const miss = gameboard.missedAttacks.some(
                    m => m[0] === x && m[1] === y
                );

                if (shipHit) cell.classList.add('hit');
                if (miss) cell.classList.add('miss');

                if (isEnemy && !game.isGameOver()) {
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

    randomizeBtn.addEventListener('click', () => {
        game.randomPlacement(game.human);
        game.randomPlacement(game.computer);
        update();
    });

    update();
};