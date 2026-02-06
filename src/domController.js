export default function domController(game) {
  const playerBoard = document.getElementById('player-board');
  const enemyBoard = document.getElementById('enemy-board');
  const status = document.getElementById('status');
  const randomizeBtn = document.getElementById('randomize');
  const clearBtn = document.getElementById('clear');
  const rotateBtn = document.getElementById('rotate');
  const startBtn = document.getElementById('start');
  const modeSelect = document.getElementById('mode');
  const dock = document.getElementById('ship-dock');
  const overlay = document.getElementById('overlay');
  const overlayText = document.getElementById('overlay-text');
  const overlayContinue = document.getElementById('overlay-continue');
  const playerTitle = document.getElementById('player-title');
  const enemyTitle = document.getElementById('enemy-title');

  let orientation = 'horizontal';
  let draggingLength = null;

  function getPlayerLabel(player) {
    const players = game.getPlayers();
    if (game.getMode() === 'vs-computer') {
      return player === players[0] ? 'You' : 'Computer';
    }
    return player === players[0] ? 'Player 1' : 'Player 2';
  }

  function getPlacementCoords(startX, startY, length) {
    const coords = [];
    for (let i = 0; i < length; i++) {
      const coord =
        orientation === 'horizontal'
          ? [startX, startY + i]
          : [startX + i, startY];
      if (coord[0] > 9 || coord[1] > 9) return null;
      coords.push(coord);
    }
    return coords;
  }

  function renderBoard(gameboard, element, options = {}) {
    const { showShips = false, allowAttacks = false, allowPlacement = false } = options;

    element.innerHTML = '';

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.x = x;
        cell.dataset.y = y;

        const hasShip = gameboard.ships.some(obj =>
          obj.coordinates.some(c => c[0] === x && c[1] === y)
        );

        const shipHit = gameboard.hitAttacks.some(
          h => h[0] === x && h[1] === y
        );

        const miss = gameboard.missedAttacks.some(
          m => m[0] === x && m[1] === y
        );

        if (showShips && hasShip) cell.classList.add('ship');
        if (shipHit) cell.classList.add('hit');
        if (miss) cell.classList.add('miss');

        if (allowPlacement) {
          cell.addEventListener('dragover', event => {
            if (!draggingLength) return;
            event.preventDefault();
          });

          cell.addEventListener('drop', event => {
            event.preventDefault();
            if (!draggingLength) return;
            const coords = getPlacementCoords(x, y, draggingLength);
            if (!coords) return;
            const placed = game.placeShipForCurrent(draggingLength, coords);
            draggingLength = null;
            if (placed) update();
          });
        }

        if (allowAttacks) {
          cell.addEventListener('click', () => {
            const result = game.playTurn([x, y]);
            if (!result.valid) {
              status.textContent = 'That spot was already targeted.';
              return;
            }
            update();

            if (game.getMode() === 'vs-computer' && !game.isGameOver()) {
              game.computerMove();
              update();
            } else if (game.getMode() === 'vs-human' && !game.isGameOver()) {
              showOverlay(`Pass to ${getPlayerLabel(game.getCurrentPlayer())}.`);
            }
          });
        }

        element.appendChild(cell);
      }
    }
  }

  function buildDock() {
    dock.innerHTML = '';

    if (game.getPhase() !== 'placement') {
      dock.classList.add('hidden');
      return;
    }

    dock.classList.remove('hidden');

    const player = game.getPlacementPlayer();
    const remaining = game.getMissingFleet(player);

    remaining.forEach(length => {
      const ship = document.createElement('div');
      ship.classList.add('ship-piece');
      ship.setAttribute('draggable', 'true');
      ship.dataset.length = length;

      for (let i = 0; i < length; i++) {
        const segment = document.createElement('span');
        segment.classList.add('ship-segment');
        ship.appendChild(segment);
      }

      ship.addEventListener('dragstart', event => {
        draggingLength = Number(ship.dataset.length);
        event.dataTransfer.setData('text/plain', String(draggingLength));
        event.dataTransfer.effectAllowed = 'move';
      });

      ship.addEventListener('dragend', () => {
        draggingLength = null;
      });

      dock.appendChild(ship);
    });
  }

  function updateStatus() {
    const phase = game.getPhase();

    if (game.isGameOver()) {
      const winner = game.getWinner();
      status.textContent = winner
        ? `${getPlayerLabel(winner)} wins!`
        : 'Game over.';
      return;
    }

    if (phase === 'placement') {
      const player = game.getPlacementPlayer();
      const missing = game.getMissingFleet(player).length;
      status.textContent = `${getPlayerLabel(player)} place your ships. Remaining: ${missing}.`;
      return;
    }

    if (phase === 'battle') {
      status.textContent = `${getPlayerLabel(game.getCurrentPlayer())}'s turn.`;
    }
  }

  function updateControls() {
    const phase = game.getPhase();
    const placementPlayer = game.getPlacementPlayer();

    randomizeBtn.disabled = phase !== 'placement';
    clearBtn.disabled = phase !== 'placement';
    rotateBtn.disabled = phase !== 'placement';
    startBtn.disabled =
      phase === 'placement' && !game.hasFullFleet(placementPlayer);

    if (phase === 'placement') {
      if (game.getMode() === 'vs-human' && placementPlayer === game.getPlayers()[0]) {
        startBtn.textContent = 'Next Player';
      } else {
        startBtn.textContent = 'Start Battle';
      }
    } else {
      startBtn.textContent = 'New Game';
    }
  }

  function updateTitles(leftPlayer, rightPlayer) {
    playerTitle.textContent = `${getPlayerLabel(leftPlayer)} Board`;
    enemyTitle.textContent = `${getPlayerLabel(rightPlayer)} Board`;
  }

  function update() {
    const phase = game.getPhase();
    const mode = game.getMode();
    const players = game.getPlayers();

    let leftPlayer;
    let rightPlayer;

    if (mode === 'vs-computer') {
      leftPlayer = players[0];
      rightPlayer = players[1];
    } else if (phase === 'placement') {
      leftPlayer = game.getPlacementPlayer();
      rightPlayer = players.find(player => player !== leftPlayer);
    } else {
      leftPlayer = game.getCurrentPlayer();
      rightPlayer = game.getOpponent();
    }

    updateTitles(leftPlayer, rightPlayer);

    const allowPlacement = phase === 'placement';
    const allowAttacks = phase === 'battle' && !game.isGameOver() && game.getCurrentPlayer().type === 'human';

    enemyBoard.classList.toggle('disabled', !allowAttacks);

    renderBoard(leftPlayer.gameboard, playerBoard, {
      showShips: true,
      allowPlacement,
    });

    renderBoard(rightPlayer.gameboard, enemyBoard, {
      showShips: game.isGameOver(),
      allowAttacks,
    });

    buildDock();
    updateControls();
    updateStatus();
  }

  function showOverlay(message) {
    overlayText.textContent = message;
    overlay.classList.remove('hidden');
  }

  function hideOverlay() {
    overlay.classList.add('hidden');
    update();
  }

  overlayContinue.addEventListener('click', hideOverlay);

  randomizeBtn.addEventListener('click', () => {
    const player = game.getPlacementPlayer();
    game.randomPlacement(player);
    update();
  });

  clearBtn.addEventListener('click', () => {
    const player = game.getPlacementPlayer();
    game.clearPlacement(player);
    update();
  });

  rotateBtn.addEventListener('click', () => {
    orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
    rotateBtn.textContent = `Rotate: ${orientation}`;
  });

  startBtn.addEventListener('click', () => {
    if (game.getPhase() === 'placement') {
      const result = game.advancePlacement();
      if (!result.ok) {
        status.textContent = 'Place all ships before starting.';
        return;
      }

      if (game.getMode() === 'vs-human') {
        if (game.getPhase() === 'placement') {
          showOverlay('Pass to Player 2 for ship placement.');
        } else {
          showOverlay('Pass to Player 1. Battle begins.');
        }
      } else {
        update();
      }
      return;
    }

    game.resetGameState();
    update();
  });

  modeSelect.addEventListener('change', () => {
    game.setMode(modeSelect.value);
    overlay.classList.add('hidden');
    update();
  });

  rotateBtn.textContent = 'Rotate: horizontal';
  update();
}
