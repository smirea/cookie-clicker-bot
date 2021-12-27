import { $, cleanHTML, Game } from 'src/utils';
import Timer from 'src/Timer';
import options from 'src/options';

export default class DragonAuraTimer extends Timer {
    execute() {
        // we're done until ascension
        if (Game.hasAura(options.dragon.auras[0])) return 'stop';

        // @TODO: apparently there's a 2nd aura slot to be handled

        const auras = this.context.getAvailableDragonAuras();

        for (const name of options.dragon.auras) {
            const aura = auras.byName[name];

            if (!aura) continue;
            if (Game.hasAura(name)) break;

            const highestBuilding = Array.from(Game.ObjectsById).reverse().find(x => x.amount > 0);
            if (!highestBuilding) break; // weird but whatever

            if (highestBuilding.amount === 1) {
                highestBuilding.sell();
                this.context.log(`🤫 Sneakily selling 1 ✕ ${highestBuilding.name} so the dragon doesn't eat it`);
            }

            Game.ClosePrompt();
            Game.SetDragonAura(aura.index, 0);

            const btn = $('#promptOption0');
            if (!btn || btn.innerText.trim().toLowerCase() !== 'confirm') {
                console.warn('[CookieAutomator.dragonAuraTimer()] FML the confirm changed');
                break;
            }
            btn.click();
            this.context.log(
                '🎇 Changed Dragon Aura: ' + aura.name + '\n(' + cleanHTML(aura.desc) + ')',
                { color: 'yellow' }
            );
            break;
        }

        return 5e3;
    }
}
