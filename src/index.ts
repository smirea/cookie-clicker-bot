import type CookieAutomatorT from './CookieAutomator';
import options from './options';

declare global {
    interface Window {
        myCookieAutomator?: CookieAutomatorT;
    }
}

setTimeout(() => {
    // importing inline so the Game object has time be defined
    const CookieAutomator = require('./CookieAutomator').default as typeof CookieAutomatorT;
    const { global, Game } = require('./utils');

    Game.volume = 0; // prevent DOM error

    global.Automator?.stop(); // stop previous instance if any

    const instance = new CookieAutomator;
    instance.switchState(options.startupState);

    global.Automator = instance; // save to window for debugging
}, 500);

'🍪🚜';
