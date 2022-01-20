import { msToTicks } from 'src/options';
import Timer from 'src/timers/Timer';
import { Grimoire } from 'src/typeDefs';
import { Game } from 'src/utils';

export default class GrimoireMinigameTimer extends Timer {
    type = 'clicker' as const;
    maxCounter = 0;
    defaultTimeout = msToTicks(500);

    startDelay() { return this.defaultTimeout; }

    execute(): void {
        const grimoire = Game.Objects['Wizard tower'].minigame;
        if (!grimoire) return this.scaleTimeout(10); // git gud first

        const { cpsMultiple } = this.context.getBuffs();

        if (cpsMultiple > 100 ||
            (cpsMultiple > 10 && grimoire.magic === grimoire.magicM)
        ) {
            return this.cast(grimoire.spells['hand of fate']);
        }
    }

    cast(spell: Grimoire.Spell): void {
        const grimoire = Game.Objects['Wizard tower'].minigame!;
        if (grimoire.getSpellCost(spell) > grimoire.magic) return;

        this.maxCounter = 0;

        if (grimoire.castSpell(spell)) {
            this.context.log(`🪄 Abra Cadabra: ${spell.name}\n(${spell.desc})`);
        } else {
            this.context.log(`🪄 Abra Ca..Whoops!: ${spell.name}\n(${spell.failDesc})`);
        }
    }
}
