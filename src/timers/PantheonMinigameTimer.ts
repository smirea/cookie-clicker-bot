import Timer from 'src/timers/Timer';
import options, { msToTicks } from 'src/options';
import { Pantheon } from 'src/typeDefs';
import { Game } from 'src/utils';

export default class PantheonMinigameTimer extends Timer {
    type = 'default' as const;
    ruinCounter = 0;
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

        if (++this.ruinCounter >= 10) this.runRuin();
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

    runRuin() {
        if (!this.context.useGodzamok()) return;
        if (Game.buffs.Devastation) return;
        if (this.pantheon?.slot[0] !== this.pantheon?.gods.ruin.id) return;

        this.ruinCounter = 0;
        const sold: Array<[number, string]> = [];
        for (const buildingKey of options.pantheon.sellForRuin) {
            const building = Game.Objects[buildingKey];
            const toSell = building.amount - 1;
            if (toSell) {
                building.sell(toSell);
                sold.push([toSell, building.name]);
            }
        }
        this.context.log(`🙏 Sacrificed for Godzamok: ${sold.map(x => `${x[0]} ✕ ${x[1]}`).join(', ')}`);
    }
}
