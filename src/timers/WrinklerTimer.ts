import Timer from 'src/timers/Timer';
import options, { msToTicks } from 'src/options';
import { Game } from 'src/utils';

export default class WrinklerTimer extends Timer {
    type = 'default' as const;

    defaultTimeout = msToTicks(8 * 60e3);

    startDelay() { return msToTicks(60e3); }

    execute(): void {
        const { cpsMultiple } = this.context.getBuffs();
        const numWrinkers = this.context.getActiveWrinklers().length;

        // lets pop more at once
        if (numWrinkers <= Game.wrinklers.length / 2) return;

        if (cpsMultiple < 1) Game.CollectWrinklers();
        else if (cpsMultiple === 1) Game.PopRandomWrinkler();

        return;
    }
}
