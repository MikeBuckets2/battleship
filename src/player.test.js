import Player from './player.js';

test('player has a gameboard', () => {
    const player = new Player();
    expect(player.gameboard).toBeDefined();
});

test('player type defaults to human', () => {
    const player = new Player();
    expect(player.type).toBe('human');
});

test('player type can be computer', () => {
    const player = new Player('computer');
    expect(player.type).toBe('computer');
});
