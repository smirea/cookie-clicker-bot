import { Game } from 'src/utils';
import Timer from 'src/Timer';
import options from 'src/options';

export default class PageReloadTimer extends Timer {
    execute() {
        if (!options.autoReloadMinutes) return 'stop';

        if (
            Date.now() - this.context.startDate / 60e3 >= options.autoReloadMinutes &&
            this.context.getBuffs().cpsMultiple <= 1
        ) {
            Game.promptOn = 0;
            global.location.reload();
            return 'stop';
        }

        return 60e3
    }
}
