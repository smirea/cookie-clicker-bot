import CookieAutomator from './CookieAutomator';
import { global } from './utils';

declare global {
    interface Window {
        myCookieAutomator?: CookieAutomator;
    }
}

setTimeout(() => {
    global.myCookieAutomator?.stop();
    global.myCookieAutomator = new CookieAutomator;
    global.myCookieAutomator.start();
    // console.log('>>', myCookieAutomator.getCps('Cursor'));
    // console.log('% =', Math.round(myCookieAutomator.getCps('Grandma') / 341437 * 100));
}, 500);

'🍪🚜';
