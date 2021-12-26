import CookieAutomator from './CookieAutomator';

declare global {
    interface Window {
        myCookieAutomator?: CookieAutomator;
    }
}

setTimeout(() => {
    window.myCookieAutomator?.stop();
    window.myCookieAutomator = new CookieAutomator;
    window.myCookieAutomator.start();
    // console.log('>>', myCookieAutomator.getCps('Cursor'));
    // console.log('% =', Math.round(myCookieAutomator.getCps('Grandma') / 341437 * 100));
}, 1);

'🍪🚜';
