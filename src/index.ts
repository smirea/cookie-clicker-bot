import type CookieAutomator from './CookieAutomator';

declare global {
    interface Window {
        myCookieAutomator?: CookieAutomator;
    }
}

setTimeout(() => {
    // importing inline so the Game object has time be defined
    const CookieAutomator = require('./CookieAutomator').default;
    const { global } = require('./utils');

    global.myCookieAutomator?.stop();
    global.myCookieAutomator = new CookieAutomator;
    global.myCookieAutomator.start();
    // console.log('>>', myCookieAutomator.getCps('Cursor'));
    // console.log('% =', Math.round(myCookieAutomator.getCps('Grandma') / 341437 * 100));
}, 500);

'🍪🚜';
