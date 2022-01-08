import { Game } from 'src/utils';
import Timer from 'src/timers/Timer';
import { msToTicks } from 'src/options';

export default class ClickNewsTimer extends Timer {
    type = 'clicker' as const;

    defaultTimeout = msToTicks(1e3);

    execute(): void {
        if (!Game.TickerEffect) return;
        if (typeof Game.TickerEffect !== 'object') return;
        if (Game.TickerEffect.type !== 'fortune') return;

        this.context.log('📰 Just in: ' + Game.Ticker);
        Game.tickerL.click(); // click on fortune news headlines
    }
}
