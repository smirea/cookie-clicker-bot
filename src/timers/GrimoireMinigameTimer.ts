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

        const { cpsMultiple, multClick, negativeBuffs, positiveBuffs } = this.context.getBuffs();
        const pctMagic = grimoire.magic / grimoire.magicM;

        if (cpsMultiple > 100
           || (cpsMultiple > 10 && pctMagic > 0.65 && !negativeBuffs)
           || multClick > 100
           || (multClick > 10 && pctMagic > 0.65 && !negativeBuffs)
        ) {
            return this.cast(grimoire.spells['stretch time']);
        }

        if (grimoire.magic === grimoire.magicM) {
            ++this.maxCounter;
            if (this.maxCounter < 10) return; // wait a bit in case others want to use the book

            if (!positiveBuffs) return this.cast(grimoire.spells['hand of fate']);

            if (Game.cookies >= this.context.realCps * 20) {
                return this.cast(grimoire.spells['conjure baked goods']);
            }
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
