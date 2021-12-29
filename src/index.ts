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
    global.myCookieAutomator?.stop();
    global.myCookieAutomator = new CookieAutomator;
    global.myCookieAutomator.start();
}, 500);

'🍪🚜';
