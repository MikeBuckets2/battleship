import Ship from './ship.js';

export default class Gameboard {
  constructor() {
    this.ships = [];
    this.missedAttacks = [];
    this.hitAttacks = [];
    this.attackedCoords = new Set();
  }

  isCoordinateOccupied(coord) {
    return this.ships.some(obj =>
      obj.coordinates.some(c => c[0] === coord[0] && c[1] === coord[1])
    );
  }

  canPlace(coordinates) {
    return coordinates.every(coord => !this.isCoordinateOccupied(coord));
  }

  placeShip(length, coordinates) {
    if (coordinates.length !== length) return false;
    if (!this.canPlace(coordinates)) return false;
    const ship = new Ship(length);
    this.ships.push({ ship, coordinates });
    return true;
  }

  receiveAttack(coord) {
    const key = `${coord[0]},${coord[1]}`;
    if (this.attackedCoords.has(key)) {
      return { valid: false };
    }

    this.attackedCoords.add(key);

    for (const shipObj of this.ships) {
      for (const shipCoord of shipObj.coordinates) {
        if (
          shipCoord[0] === coord[0] &&
          shipCoord[1] === coord[1]
        ) {
          shipObj.ship.hit();
          this.hitAttacks.push(coord);
          return { valid: true, hit: true, sunk: shipObj.ship.isSunk() };
        }
      }
    }
    this.missedAttacks.push(coord);
    return { valid: true, hit: false };
  }

  allShipsSunk() {
    return this.ships.every(obj => obj.ship.isSunk());
  }

  hasBeenAttacked(coord) {
    return this.attackedCoords.has(`${coord[0]},${coord[1]}`);
  }

  reset() {
    this.ships = [];
    this.missedAttacks = [];
    this.hitAttacks = [];
    this.attackedCoords = new Set();
  }
}
