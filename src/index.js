import './style.css';
import createGame from './gameController.js';
import domController from './domController.js';

const game = createGame();
domController(game);