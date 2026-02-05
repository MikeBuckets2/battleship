import Ship from './ship.js';

test('ship has a length', () => {
    const ship = new Ship(3);
    expect(ship.length).toBe(3);
});

test('ship starts with 0 hits', () => {
    const ship = new Ship(3);
    expect(ship.hits).toBe(0);
});

test('hit() increases hits', () => {
    const ship = new Ship(3);
    ship.hit();
    expect(ship.hits).toBe(1);
});

test('ship is sunk when hits equal length', () => {
    const ship = new Ship(2);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
});