import Timer from 'src/timers/Timer';
import options, { msToTicks } from 'src/options';
import { Pantheon } from 'src/typeDefs';
import { Game } from 'src/utils';

export default class PantheonMinigameTimer extends Timer {
    type = 'default' as const;

    defaultTimeout = msToTicks(1000);

    startDelay() { return this.defaultTimeout; }

    get pantheon() { return Game.Objects.Temple.minigame; }

    execute(): void {
        if (!this.pantheon) return;

        const { layout } = options.pantheon;

        for (const [slot, godKey] of layout.entries()) {
            if (!godKey) continue;
            const god = this.pantheon.gods[godKey];
            if (this.pantheon.slot[slot] === god.id) continue;
            this.slotGod(god, slot);
            return;
        }
    }

    slotGod(_god: Pantheon.God | Pantheon.GodKey, slot: number): boolean {
        const pantheon = this.pantheon!;
        if (!pantheon) return false;
        if (!pantheon.swaps) return false;

        const god = typeof _god === 'string' ? pantheon.gods[_god] : _god;
        pantheon.dragGod(god);
        pantheon.hoverSlot(slot);
        pantheon.dropGod();
        this.context.log(`🙏 Started worshipping ${god.name} in ${pantheon.slotNames[slot]}\n${((god as any)['desc' + (slot + 1)])}`);

        return true;
    }
}
