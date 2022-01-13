import Timer from 'src/timers/Timer';
import { Grimoire } from 'src/typeDefs';
import { Game } from 'src/utils';

export default class GrimoireMinigameTimer extends Timer {
    type = 'default' as const;

    defaultTimeout = 500;

    startDelay() { return this.defaultTimeout; }

    execute(): void {
        const grimoire = Game.Objects['Wizard tower'].minigame;
        if (!grimoire) return this.scaleTimeout(10); // git gud first

        const { cpsMultiple, multClick, negativeBuffs, positiveBuffs } = this.context.getBuffs();
        const pctMagic = grimoire.magic / grimoire.magicM;

        const cast = (spell: Grimoire.Spell): void => {
            if (grimoire.getSpellCost(spell) <= grimoire.magic) {
                if (grimoire.castSpell(spell)) {
                    this.context.log(`🪄 Abra Cadabra: ${spell.name}\n(${spell.desc})`);
                } else {
                    this.context.log(`🪄 Abra Ca..Whoops!: ${spell.name}\n(${spell.failDesc})`);
                }
            }
        }

        if (
            cpsMultiple > 100
            || (cpsMultiple > 5 && pctMagic > 0.65 && !negativeBuffs)
            || multClick > 100
            || (multClick > 5 && pctMagic > 0.65 && !negativeBuffs)
        ) {
            return cast(grimoire.spells['stretch time']);
        }

        if (grimoire.magic === grimoire.magicM) {
            if (!positiveBuffs) return cast(grimoire.spells['hand of fate']);

            if (Game.cookies >= this.context.realCps * 20) {
                return cast(grimoire.spells['conjure baked goods']);
            }
        }
    }
}
