import { global, getGame } from './utils';

function init (): any {
    const Game = getGame();

    if (!Game) {
        console.log('[Automator] Waiting for the Game to start');
        return setTimeout(init, 500);
    }

    // importing inline so the Game object has time be defined
    const { default: Automator } = require('./Automator') as typeof import('./Automator');

    Game.volume = 0; // prevent DOM error
    Game.prefs.notifs = 1; // there's gonna be a lot of notifications
    Game.prefs.showBackupWarning = 0;

    global.Automator?.stop(); // stop previous instance if any

    const instance = new Automator;
    global.Automator = instance; // save to window for debugging
};

export default null;

init();

'🍪🚜';
