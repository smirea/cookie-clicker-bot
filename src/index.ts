import type AutomatorT from './Automator';
import options from './options';

declare global {
    interface Window {
        Automator?: AutomatorT;
    }
}

setTimeout(() => {
    // importing inline so the Game object has time be defined
    const Automator = require('./Automator').default as typeof AutomatorT;
    const { global, Game } = require('./utils');

    Game.volume = 0; // prevent DOM error

    global.Automator?.stop(); // stop previous instance if any

    const instance = new Automator;
    instance.switchState(options.startupState);

    global.Automator = instance; // save to window for debugging
}, 500);

'🍪🚜';
