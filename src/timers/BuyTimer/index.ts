import Timer from 'src/timers/Timer';
import { Game } from 'src/utils';

import BuildingBuyer from './BuildingBuyer';
import DragonBuyer from './DragonBuyer';
import SantaBuyer from './SantaBuyer';
import UpgradeBuyer from './UpgradeBuyer';

export default class BuyTimer extends Timer {
    type = 'default' as const;

    defaultTimeout = 15;

    buyers = {
        BuildingBuyer: new BuildingBuyer(this.context),
        DragonBuyer: new DragonBuyer(this.context),
        SantaBuyer: new SantaBuyer(this.context),
        UpgradeBuyer: new UpgradeBuyer(this.context),
    };

    sideEffects(): void {
        this.context.cpsCache = {};
        this.context.lastState.buildings = this.buyers.BuildingBuyer?.getSortedBuildings() ?? [];
    }

    execute(): void {
        if (this.context.upgradeFatigue > 0 && Game.cookiesPs >= 1e10) {
            this.context.upgradeFatigue = 0;
        }

        const orders = this.getBuyOrders();
        const next = orders[0];
        const log = (item: { log?: typeof orders[number]['log'] }) => {
            if (!item.log) return;
            const { msg, ...config } = item.log();
            this.context.log(msg, config);
        }

        if (next?.type === 'buy') {
            log(next); // must happen before buy() since it might use the current state to log
            next.buy();
        } else if (next?.type === 'wait') {
            log(next);
            this.scaleTimeout(5);
        } else {
            this.scaleTimeout(10);
            return this.context.log("You're too poor... but that's a good thing!");
        }
    }

    getBuyOrders() {
        const result = [];
        for (const buyer of Object.values(this.buyers)) {
            for (const order of buyer.execute()) {
                result.push({
                    buyer: buyer.constructor.name,
                    ...order,
                });
            }
        }
        result.sort((a, b) => b.score - a.score);
        return result;
    }

    print() {
        const counters: Record<string, number> = {};
        const table: Record<string, any> = {};

        for (const { buyer, type, cookies, score, log } of this.getBuyOrders()) {
            const count = counters[buyer] = (counters[buyer] || 0) + 1;
            let name = `[${type.padStart(4)}] ` + buyer.replace(/Buyer$/, '');
            if (count > 1) name += '_' + count;
            table[name] = {
                score,
                cookies,
                log: log?.().msg ?? null,
            };
        }

        console.table(table);
    }
}
