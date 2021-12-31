import { Game } from 'src/utils';
import Timer from 'src/timers/Timer';
import { msToTicks } from 'src/options';

export default class SugarLumpTimer extends Timer {
    type = 'clicker' as const;

    defaultTimeout = msToTicks(0.5 * 3600e3);

    execute(): void {
        if (Date.now() - Game.lumpT > Game.lumpMatureAge) Game.clickLump();
    }
}
