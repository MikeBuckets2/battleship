import Ship from './ship.js';

export default class Gameboard {
    constructor() {
        this.ships = [];
        this.missedAttacks = [];
    }

    placeShip(length, coordinates) {
        const ship = new Ship(length);
        this.ships.push({ ship, coordinates });
    }

    receiveAttack(coord) {
        for (const shipObj of this.ships) {
            for (const shipCoord of shipObj.coordinates) {
                if (shipCoord[0] === coord[0] && 
                    shipCoord[1] === coord[1]
                ) {
                    shipObj.ship.hit();
                    return;
                }
            }
        }
        this.missedAttacks.push(coord);
    }

    allShipsSunk() {
        return this.ships.every(obj => obj.ship.isSunk());
    }
};