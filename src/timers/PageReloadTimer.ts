import { Game } from 'src/utils';
import Timer from 'src/Timer';
import options from 'src/options';

export default class PageReloadTimer extends Timer {
    defaultTimeout = 60e3;

    execute(): void {
        if (!options.autoReloadMinutes) return this.stopTimeout();

        if (
            Date.now() - this.context.startDate / 60e3 >= options.autoReloadMinutes &&
            this.context.getBuffs().cpsMultiple <= 1
        ) {
            Game.promptOn = 0;
            global.location.reload();
            return this.stopTimeout();
        }
    }
}
