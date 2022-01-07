import options from 'src/options';
import { Building } from 'src/typeDefs';
import { formatAmount, Game, getCostOfNBuildings } from 'src/utils';
import Buyer, { GetOrdersResult } from './Buyer';

export default class BuildingThresholdBuyer extends Buyer {
    scale(x: number) { return x ** 2; }

    getOrders(): GetOrdersResult {
        if (Game.cookiesPs < 1e3) return null;

        const active: Array<{
            obj: Building;
            toBuy: number;
            amount: number;
            price: number;
        }> = [];

        for (const obj of Game.ObjectsById) {
            if (!obj.bought || obj.amount <= 1) continue;
            const ranges = options.achievementThresholds[obj.name] || options.achievementThresholds.Default;
            if (obj.amount >= ranges[ranges.length - 1]) continue;
            const index = ranges.findIndex((start, i) => start <= obj.amount && obj.amount < ranges[i + 1]);
            const amount = ranges[index + 1];
            const price = getCostOfNBuildings(obj, amount) || 1;
            const toBuy = amount - obj.amount;
            active.push({
                obj,
                toBuy,
                amount,
                price,
            } as const);
        }

        active.sort((a, b) => a.price - b.price);
        const next = active[0];

        if (!next) return null;

        const base = {
            ratio: Game.cookies / next.price,
            cookies: next.price,
        };

        if (next.price <= Game.cookies) {
            return {
                type: 'buy',
                ...base,
                buy: () => this.context.buy(next.obj, next.toBuy),
                log: () => ({
                    msg: `🚀 To the moon: Bought from ${next.obj.amount} → ${next.amount} of ${next.obj.name}`,
                }),
            };
        }

        if (next.price * 0.8 <= Game.cookies) {
            return {
                type: 'wait',
                ...base,
                log: () => ({
                    msg: `🟡 Waiting to buy to threshold for ${next.obj.name} - ${formatAmount(next.price)}`,
                    eta: this.getEta(next.price),
                }),
            };
        }

        return null;
    }
}
