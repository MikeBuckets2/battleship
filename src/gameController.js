import Player from './player.js';

const BOARD_SIZE = 10;
const FLEET = [5, 4, 3, 3, 2];

const PRESET_PLAYER_ONE = [
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ],
  [
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
  ],
  [
    [7, 1],
    [7, 2],
    [7, 3],
  ],
  [
    [5, 6],
    [5, 7],
    [5, 8],
  ],
  [
    [9, 5],
    [9, 6],
  ],
];

const PRESET_PLAYER_TWO = [
  [
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
  ],
  [
    [0, 8],
    [1, 8],
    [2, 8],
    [3, 8],
  ],
  [
    [6, 1],
    [6, 2],
    [6, 3],
  ],
  [
    [8, 7],
    [8, 8],
    [8, 9],
  ],
  [
    [4, 0],
    [4, 1],
  ],
];

function inBounds([x, y]) {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

function clonePreset(preset) {
  return preset.map(ship => ship.map(coord => [...coord]));
}

export default function createGame() {
  let mode = 'vs-computer';
  let players = [];
  let currentPlayerIndex = 0;
  let placementIndex = 0;
  let phase = 'placement';
  let gameOver = false;
  let winner = null;
  let aiTargets = [];

  function createPlayers() {
    players = [
      new Player('human'),
      mode === 'vs-computer' ? new Player('computer') : new Player('human'),
    ];
  }

  function getCurrentPlayer() {
    return players[currentPlayerIndex];
  }

  function getOpponent() {
    return players[1 - currentPlayerIndex];
  }

  function getPlacementPlayer() {
    return players[placementIndex];
  }

  function getMissingFleet(player) {
    const remaining = [...FLEET];
    player.gameboard.ships.forEach(obj => {
      const index = remaining.indexOf(obj.ship.length);
      if (index !== -1) remaining.splice(index, 1);
    });
    return remaining;
  }

  function hasFullFleet(player) {
    return getMissingFleet(player).length === 0;
  }

  function applyPreset(player, preset) {
    player.gameboard.reset();
    preset.forEach(coords => {
      player.gameboard.placeShip(coords.length, coords);
    });
  }

  function setupBoards() {
    applyPreset(players[0], clonePreset(PRESET_PLAYER_ONE));
    applyPreset(players[1], clonePreset(PRESET_PLAYER_TWO));
  }

  function resetGameState() {
    gameOver = false;
    winner = null;
    phase = 'placement';
    currentPlayerIndex = 0;
    placementIndex = 0;
    aiTargets = [];

    players.forEach(player => player.gameboard.reset());
    setupBoards();
  }

  function setMode(newMode) {
    mode = newMode;
    createPlayers();
    resetGameState();
  }

  function switchTurns() {
    currentPlayerIndex = 1 - currentPlayerIndex;
  }

  function placeShipForCurrent(length, coordinates) {
    if (phase !== 'placement') return false;

    const player = getPlacementPlayer();
    const remaining = getMissingFleet(player);
    if (!remaining.includes(length)) return false;

    return player.gameboard.placeShip(length, coordinates);
  }

  function clearPlacement(player) {
    player.gameboard.reset();
  }

  function randomPlacement(player) {
    player.gameboard.reset();

    FLEET.forEach(length => {
      let placed = false;

      while (!placed) {
        const x = Math.floor(Math.random() * BOARD_SIZE);
        const y = Math.floor(Math.random() * BOARD_SIZE);
        const horizontal = Math.random() > 0.5;
        const coordinates = [];

        for (let i = 0; i < length; i++) {
          const coord = horizontal ? [x, y + i] : [x + i, y];
          if (!inBounds(coord)) {
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

  function advancePlacement() {
    const player = getPlacementPlayer();
    if (!hasFullFleet(player)) {
      return { ok: false };
    }

    if (mode === 'vs-human' && placementIndex === 0) {
      placementIndex = 1;
      return { ok: true, phase: 'placement' };
    }

    phase = 'battle';
    currentPlayerIndex = 0;
    return { ok: true, phase: 'battle' };
  }

  function playTurn(coordinates) {
    if (phase !== 'battle' || gameOver) return { valid: false };

    const defender = getOpponent();
    const result = defender.gameboard.receiveAttack(coordinates);
    if (!result || result.valid === false) return { valid: false };

    if (defender.gameboard.allShipsSunk()) {
      gameOver = true;
      winner = getCurrentPlayer();
      phase = 'gameover';
      return { valid: true, gameOver: true, winner };
    }

    switchTurns();
    return { valid: true, hit: result.hit, sunk: result.sunk };
  }

  function addAdjacentTargets(coord, board) {
    const [x, y] = coord;
    const candidates = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];

    candidates.forEach(candidate => {
      if (!inBounds(candidate)) return;
      if (board.hasBeenAttacked(candidate)) return;
      if (aiTargets.some(target => target[0] === candidate[0] && target[1] === candidate[1])) return;
      aiTargets.push(candidate);
    });
  }

  function computerMove() {
    if (mode !== 'vs-computer') return { valid: false };
    if (phase !== 'battle' || gameOver) return { valid: false };
    if (getCurrentPlayer().type !== 'computer') return { valid: false };

    const opponent = getOpponent();
    let move = null;

    while (aiTargets.length > 0) {
      const candidate = aiTargets.shift();
      if (!opponent.gameboard.hasBeenAttacked(candidate)) {
        move = candidate;
        break;
      }
    }

    if (!move) {
      do {
        move = [
          Math.floor(Math.random() * BOARD_SIZE),
          Math.floor(Math.random() * BOARD_SIZE),
        ];
      } while (opponent.gameboard.hasBeenAttacked(move));
    }

    const result = playTurn(move);

    if (result.valid && result.hit) {
      addAdjacentTargets(move, opponent.gameboard);
      if (result.sunk) aiTargets = [];
    }

    return result;
  }

  createPlayers();
  resetGameState();

  return {
    getMode: () => mode,
    setMode,
    getPhase: () => phase,
    getPlayers: () => [...players],
    getCurrentPlayer,
    getOpponent,
    getPlacementPlayer,
    getMissingFleet,
    hasFullFleet,
    placeShipForCurrent,
    clearPlacement,
    randomPlacement,
    advancePlacement,
    playTurn,
    computerMove,
    resetGameState,
    isGameOver: () => gameOver,
    getWinner: () => winner,
  };
}
