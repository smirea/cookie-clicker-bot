import Timer from 'src/timers/Timer';
import options, { msToTicks } from 'src/options';
import { Game } from 'src/utils';

export default class WrinklerTimer extends Timer {
    type = 'clicker' as const;
    maxCounter = 0;

    defaultTimeout = msToTicks(0.25 * 60e3);

    startDelay() { return msToTicks(5e3); }

    execute(): void {
        if (!options.grandmapocalypse.enabled) {
            const elderPledgeUpgrade = Game.Upgrades['Elder Pledge'];
            if (elderPledgeUpgrade.unlocked && elderPledgeUpgrade.canBuy()) {
                this.context.buy(elderPledgeUpgrade);
                this.context.log('👵 A truce was signed', { color: 'orange' });
            }
            return;
        }

        const numWrinkers = this.context.getActiveWrinklers().length;
        if (numWrinkers < Game.getWrinklersMax()) return;

        ++this.maxCounter;
        if (this.maxCounter < 1000) return;

        const pantheonSlots = Game.Objects.Temple.minigame?.slot ?? 0;
        if (pantheonSlots >= 2 && this.context.timers.PantheonMinigameTimer?.slotGod('scorn', 0)) {
            this.maxCounter = 0;
            this.context.log('🐛 POP go the wrinklers');
            Game.CollectWrinklers();
        }
    }
}
