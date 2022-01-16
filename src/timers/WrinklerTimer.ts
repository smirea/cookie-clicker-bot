import Timer from 'src/timers/Timer';
import { msToTicks } from 'src/options';
import { Game } from 'src/utils';

export default class WrinklerTimer extends Timer {
    type = 'clicker' as const;
    maxCounter = 0;

    defaultTimeout = msToTicks(4 * 60e3);

    startDelay() { return msToTicks(60e3); }

    execute(): void {
        const numWrinkers = this.context.getActiveWrinklers().length;
        if (numWrinkers < Game.getWrinklersMax()) return;

        ++this.maxCounter;
        if (this.maxCounter < 100) return;

        const pantheonSlots = Game.Objects.Temple.minigame?.slot ?? 0;
        if (pantheonSlots >= 2 && this.context.timers.PantheonMinigameTimer?.slotGod('scorn', 0)) {
            this.maxCounter = 0;
            this.context.log('🐛 POP go the wrinklers');
            Game.CollectWrinklers();
        }
    }
}
