import Timer from 'src/timers/Timer';
import options, { msToTicks } from 'src/options';
import { Game } from 'src/utils';

export default class WrinklerTimer extends Timer {
    type = 'default' as const;
    maxCounter = 0;

    defaultTimeout = msToTicks(4 * 60e3);

    startDelay() { return msToTicks(60e3); }

    execute(): void {
        const { cpsMultiple } = this.context.getBuffs();
        const numWrinkers = this.context.getActiveWrinklers().length;

        if (numWrinkers === Game.getWrinklersMax()) ++this.maxCounter;
        else this.maxCounter = 0;

        if (this.maxCounter >= 3) {
            const elderPledge = Game.Upgrades['Elder Pledge'];
            if (elderPledge.canBuy()) {
                this.context.log('🐛 Taking a break from the grannies');
                this.context.buy(elderPledge);
            } else {
                this.context.log('🐛 POP go the wrinklers');
                Game.CollectWrinklers();
            }
            this.maxCounter = 0;
            return
        }

        // lets pop more at once
        if (numWrinkers <= Game.wrinklers.length / 2) return;

        if (cpsMultiple < 1) return Game.CollectWrinklers();

        if (cpsMultiple === 1) return Game.PopRandomWrinkler();
    }
}
