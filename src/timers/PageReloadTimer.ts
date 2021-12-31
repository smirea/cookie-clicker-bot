import { Game } from 'src/utils';
import Timer from 'src/timers/Timer';
import options, { msToTicks } from 'src/options';

export default class PageReloadTimer extends Timer {
    type = 'default' as const;

    defaultTimeout = msToTicks(60e3);

    execute(): void {
        if (!options.autoReloadMinutes) return this.stop();

        if (
            Date.now() - this.context.startDate / 60e3 >= options.autoReloadMinutes &&
            this.context.getBuffs().cpsMultiple <= 1
        ) {
            Game.promptOn = 0;
            global.location.reload();
            return this.stop();
        }
    }
}
