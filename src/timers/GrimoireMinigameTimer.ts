import Timer from 'src/Timer';
import { Spell } from 'src/typeDefs';
import { cleanHTML, Game } from 'src/utils';

export default class GrimoireMinigameTimer extends Timer {
    defaultTimeout = 5e3;

    startDelay() { return this.defaultTimeout; }

    execute(): void {
        const grimoire = Game.Objects['Wizard tower'].minigame;
        if (!grimoire) return this.scaleTimeout(10); // git gud first

        const { cpsMultiple, negativeBuffs, positiveBuffs } = this.context.getBuffs();
        const pctMagic = grimoire.magic / grimoire.magicM;

        const cast = (spell: Spell): void => {
            if (grimoire.getSpellCost(spell) <= grimoire.magic) {
                if (grimoire.castSpell(spell)) {
                    this.context.log(`🪄 Abra Cadabra: ${spell.name}\n(${cleanHTML(spell.desc)})`);
                } else {
                    this.context.log(`🪄 Abra Ca..Whoops!: ${spell.name}\n(${cleanHTML(spell.failDesc)})`);
                }
            }
        }

        if (cpsMultiple > 5 && pctMagic > 0.65) {
            if (!negativeBuffs) return cast(grimoire.spells['stretch time']);
        }

        if (grimoire.magic === grimoire.magicM) {
            if (!positiveBuffs) return cast(grimoire.spells['hand of fate']);

            if (Game.cookies >= this.context.realCps * 20) {
                return cast(grimoire.spells['conjure baked goods']);
            }
        }
    }
}