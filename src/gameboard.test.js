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

test('cannot place overlapping ships', () => {
    const board = new Gameboard();
    board.placeShip(3, [[0,0], [0,1], [0,2]]);
    const placed = board.placeShip(2, [[0,1], [0,2]]);
    expect(placed).toBe(false);
    expect(board.ships.length).toBe(1);
});

test('repeated attacks are rejected', () => {
    const board = new Gameboard();
    board.receiveAttack([5,5]);
    const result = board.receiveAttack([5,5]);
    expect(result.valid).toBe(false);
    expect(board.missedAttacks.length).toBe(1);
});

test('placeShip returns false when length does not match coordinates', () => {
    const board = new Gameboard();
    const placed = board.placeShip(3, [[0,0], [0,1]]);
    expect(placed).toBe(false);
    expect(board.ships.length).toBe(0);
});
