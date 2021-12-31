import { Game } from 'src/utils';
import Timer from 'src/timers/Timer';
import { msToTicks } from 'src/options';

export default class ClickCookieTimer extends Timer {
    type = 'clicker' as const;

    defaultTimeout = msToTicks(1000 / 15.1);

    execute(): void {
        Game.ClickCookie();
    }
}
