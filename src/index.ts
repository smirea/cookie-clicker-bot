import type CookieAutomator from './CookieAutomator';

declare global {
    interface Window {
        myCookieAutomator?: CookieAutomator;
    }
}

setTimeout(() => {
    // importing inline so the Game object has time be defined
    const CookieAutomator = require('./CookieAutomator').default;
    const { global, Game } = require('./utils');

    Game.volume = 0; // prevent DOM error
    global.Automator?.stop();
    global.Automator = new CookieAutomator;
    global.Automator.start();
}, 500);

'🍪🚜';
