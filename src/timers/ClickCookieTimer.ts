import { Game } from 'src/utils';
import Timer from 'src/timers/Timer';
import { msToTicks } from 'src/options';

export default class ClickCookieTimer extends Timer {
    type = 'clicker' as const;

    defaultTimeout = msToTicks(51);

    // mouseEvent = new MouseEvent('click', { detail: 1 });
    mouseEvent = undefined;

    execute(): void {
        Game.ClickCookie(this.mouseEvent);
    }
}
