/**
 * Empire Builder - Einstiegspunkt
 * Initialisiert Engine und UI, startet den Game-Loop
 */
import GameEngine from './engine.js';
import GameUI from './ui.js';
import { TICK_INTERVAL } from './config.js';

const engine = new GameEngine();
const ui = new GameUI(engine);

engine.load();
ui.init();

setInterval(() => {
    const result = engine.tick();
    ui.handleTickResult(result);
}, TICK_INTERVAL);
