import Gameboard from './gameboard.js';

test('gameboard can place a ship', () => {
    const board = new Gameboard();
    board.placeShip(2, [[0,0], [0,1]]);
    expect(board.ships.length).toBe(1);
});

test('receiveAttack hits a ship', () => {
    const board = new Gameboard();
    board.placeShip(2, [[0,0], [0,1]]);
    board.receiveAttack([0,0]);
    expect(board.ships[0].ship.hits).toBe(1);
});

test('missed attacks are recorded', () => {
    const board = new Gameboard();
    board.receiveAttack([5,5]);
    expect(board.missedAttacks).toContainEqual([5,5]);
});

test('reports when all ships are sunk', () => {
    const board = new Gameboard();
    board.placeShip(1, [[0,0]]);
    board.receiveAttack([0,0]);
    expect(board.allShipsSunk()).toBe(true);
});