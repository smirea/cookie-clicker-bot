import { $, fixMenuBug, Game } from 'src/utils';
import Timer from 'src/Timer';
import options from 'src/options';

export default class DragonAuraTimer extends Timer {
    type = 'default' as const;

    defaultTimeout = 5e3;

    startDelay() { return this.defaultTimeout; }

    execute(): void {
        const auras = this.context.getAvailableDragonAuras();
        const has2Auras = Game.dragonLevel >= Game.dragonLevels.length - 1;
        const toSelectIds = options.dragon.auras.map(name => auras.byName[name]?.index ?? -1);
        let choices = has2Auras ? 2 : 1;

        for (const name of options.dragon.auras) {
            if (choices <= 0) break;
            const aura = auras.byName[name];

            if (!aura) continue;

            --choices;

            if (Game.hasAura(name)) continue;

            const highestBuilding = Array.from(Game.ObjectsById).reverse().find(x => x.amount > 0);
            if (!highestBuilding) break; // weird but whatever

            if (highestBuilding.amount === 1) {
                highestBuilding.sell();
                this.context.log(`🤫 Sneakily selling 1 ✕ ${highestBuilding.name} so the dragon doesn't eat it`);
            }

            let slot: 0 | 1 = has2Auras && toSelectIds.includes(Game.dragonAura) ? 1 : 0;

            Game.SetDragonAura(aura.index, slot);

            const btn = $('#promptOption0');
            if (!btn || btn.innerText.trim().toLowerCase() !== 'confirm') {
                console.warn('[CookieAutomator.dragonAuraTimer()] FML the confirm changed');
                break;
            }
            btn.click();
            this.context.log(
                `🎇 Changed Dragon Aura (slot ${slot + 1}): ${aura.name}\n(${aura.desc})`,
                { color: 'yellow' }
            );

            break;
        }

        Game.ClosePrompt();
        fixMenuBug();
    }
}
