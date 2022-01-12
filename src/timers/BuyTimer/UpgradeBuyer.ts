import options from 'src/options';
import { Upgrade } from 'src/typeDefs';
import { Game } from 'src/utils';
import Buyer, { GetOrdersResult } from './Buyer';

export default class UpgradeBuyer extends Buyer {
    scale(x: number) { return x; }

    get upgradeFatigue() { return this.context.upgradeFatigue || 1; }

    getOrders(): GetOrdersResult {
        if (Game.cookiesPs < 1) return null;

        const active = this.context.getAvailableUpgrades()
            .sort((a, b) => this.getWillingness(a) - this.getWillingness(b));
        const next = active[0]?.canBuy()
            ? active[0]
            // just buy really cheap upgrades
            : active.find(x => x.getPrice() <= Game.cookies * 0.01);

        if (next) {
            return {
                type: 'buy',
                cookies: next.getPrice(),
                ratio: Game.cookies / next.getPrice(),
                buy: () => this.context.buy(next),
                log: () => ({
                    msg: `💹 Bought new upgrade: ${next.name}\n(${next.desc})`,
                    // color: 'lightgreen',
                }),
            };
        }

        if (!active[0]) return null;

        const waitPrice = active[0].getPrice() * options.upgradeWait * this.upgradeFatigue;
        const nextWait = (
            active[0] && Game.cookies >= 30e3 && Game.cookies >= waitPrice
                ? active[0]
                : null
        );

        if (!nextWait) return null;

        const waitPct = Math.round(Game.cookies / active[0].getPrice() * 100) + '%';

        return {
            type: 'wait',
            ratio: Game.cookies / this.getWillingness(nextWait),
            cookies: nextWait.getPrice(),
            log: () => ({
                msg: `🟡 Waiting to buy new upgrade: ${nextWait.name}`,
                eta: this.getEta(nextWait.getPrice()),
                extra: waitPct,
            }),
        };
    }

    /** takes into account willingness factor, used for sorting */
    getWillingness(upgrade: Upgrade) {
        let price = upgrade.getPrice();
        price *= this.upgradeFatigue;

        if (/cookie production multiplier/i.test(upgrade.desc)) price *= 1.2;
        else if (/clicking gains/i.test(upgrade.desc)) price *= 0.8;
        else if (/grandmas|twice/i.test(upgrade.desc)) price *= 0.6;
        else if (/mouse and cursor/i.test(upgrade.desc)) price *= 0.5;
        else if (/prestige/i.test(upgrade.desc)) price *= 0.01; // highest value

        return price;
    }
}
