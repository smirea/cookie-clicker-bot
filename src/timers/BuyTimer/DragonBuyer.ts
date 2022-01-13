import type Automator from 'src/Automator';
import options from 'src/options';
import { Building, DragonLevelGoal } from 'src/typeDefs';
import { fixMenuBug, formatAmount, Game, getCostOfNBuildings } from 'src/utils';
import Buyer, { GetOrdersResult } from './Buyer';

export default class DragonBuyer extends Buyer {
    scale(x: number) { return x ** 3; }

    handlers: Record<string, (amount: number) => DragonLevelGoal>;

    constructor(context: Automator) {
        super(context);

        this.handlers = {
            'million cookies': amount => ({
                type: 'cookie',
                amount: amount * 1e6,
                cookies: amount * 1e6,
                buy: () => {},
            }) as const,
            'of every building': amount => ({
                type: 'all',
                amount,
                cookies: Game.ObjectsById.find(x => x.locked)
                    ? Infinity // unlock all buildings first
                    : Game.ObjectsById
                        .map(obj => getCostOfNBuildings(obj, amount))
                        .reduce((s, x) => s + x, 0) ||
                    Game.ObjectsById
                        .map(obj => getCostOfNBuildings(obj, amount, amount * .9))
                        .reduce((s, x) => s + x, 0),
                buy: () => {
                    for (const building of Array.from(Game.ObjectsById).reverse()) {
                        this.buyToAmount(building, amount);
                    }
                },
            }) as const,
        };

        for (const building of Game.ObjectsById) {
            this.handlers[building.plural] = amount => ({
                type: 'building',
                value: building.name,
                amount,
                cookies: getCostOfNBuildings(building, amount) || getCostOfNBuildings(building, amount, amount * .5),
                buy: () => this.buyToAmount(building, amount),
            }) as const;
        }
    }

    buyToAmount = (building: Building, amount: number) => {
        if (building.amount >= amount) return;
        const toBuy = amount - building.amount;
        this.context.buy(building, toBuy);
        this.context.log(`🐲 Bought ${toBuy} ✕ ${building.name} to feed to the dragon`);
    }

    getOrders(): GetOrdersResult {
        if (!Game.Upgrades['A crumbly egg'].bought) return null;
        if (Game.cookiesPs < 1e5 || Game.dragonLevel >= Game.dragonLevels.length - 1) return null;

        // higher value = lower priority
        // once your favorite aura has been researched, deprioritize dragon upgrades till you have the 2nd one
        const auraPenalty = this.context.getAvailableDragonAuras().byName[options.dragon.auras[0]]
            ? 1.5
            : 1;

        // focus on buying cheap upgrades first
        const upgradePenalty = 0.25 * Game.UpgradesInStore.filter(x => !x.pool && x.getPrice() <= 10e6).length;

        // upgrading dragon should only come when there's extra cash
        const penalty = 3 + auraPenalty + upgradePenalty;

        const lvl = Game.dragonLevels[Game.dragonLevel];
        const match = lvl.costStr().match(/^(\d+) (.*)$/) || [];
        const amount = parseInt(match[1]);
        const unit = match[2];

        if (!amount || Number.isNaN(amount) || !unit) {
            console.warn('[Automator:getDragonStats()] Cannot parse: %s', lvl.costStr());
            return null;
        }

        if (!this.handlers[unit]) {
            console.warn('[Automator:getDragonStats()] Unknown unit: %s', lvl.costStr());
            return null;
        }

        const goal = this.handlers[unit](amount);
        const ratio = Game.cookies / (goal.cookies * penalty);
        const base = { ratio, cookies: goal.cookies };

        if (ratio >= 1) {
            // there are enough buildings / cookies bought to upgrade
            if (lvl.cost()) {
                return {
                    type: 'buy',
                    ...base,
                    buy: () => {
                        this.context.buy({ name: 'dragon', buy: () => Game.UpgradeDragon() });
                        fixMenuBug();
                    },
                    log: () => ({
                        msg: `🔥 Trained your dragon for the low low cost of ${lvl.costStr()} \n(${lvl.action})`,
                        color: 'orange'
                    }),
                };
            }

            // need to buy more buildings
            return {
                type: 'buy',
                ...base,
                buy: () => this.context.buy({ buy: () => goal.buy() }),
                log: () => ({ msg: `🐲 Preparing a feast` }),
            };
        }

        if (ratio < options.dragon.waitRatios[goal.type]) return null;

        return {
            type: 'wait',
            ...base,
            log: () => ({
                msg: `🐲 Raising cookies to feed the dragon, need ${formatAmount(goal.cookies)} to get ${lvl.costStr()}`,
                eta: this.getEta(goal.cookies),
            }),
        };
    }
}
