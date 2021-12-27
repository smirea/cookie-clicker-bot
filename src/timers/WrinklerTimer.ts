import Timer from 'src/Timer';
import options from 'src/options';
import { Game } from 'src/utils';

export default class WrinklerTimer extends Timer {
    execute() {
        const { cpsMultiple } = this.context.getBuffs();
        const numWrinkers = this.context.getActiveWrinklers().length;

        // lets pop more at once
        if (numWrinkers <= Game.wrinklers.length / 2) return options.wrinklerPopTime;

        if (cpsMultiple < 1) Game.CollectWrinklers();
        else if (cpsMultiple === 1) Game.PopRandomWrinkler();

        return options.wrinklerPopTime;
    }
}
