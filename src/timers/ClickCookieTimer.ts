import { Game } from 'src/utils';
import options from 'src/options';
import Timer from 'src/Timer';

export default class ClickCookieTimer extends Timer {
    defaultTimeout = options.cookieClickTimeout;

    execute(): void {
        Game.ClickCookie();
    }
}
