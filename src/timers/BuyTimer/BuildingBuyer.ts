import options from 'src/options';
import { BuildingMeta } from 'src/typeDefs';
import { Game, getAffordableBuildingMultiple } from 'src/utils';
import Buyer, { GetOrdersResult } from './Buyer';

export default class BuildingBuyer extends Buyer {
    scale(x: number) { return x ** 1.5; }

    getOrders(): GetOrdersResult {
        const sorted = this.getSortedBuildings();
        const active = Game.ObjectsById.filter(x => !x.bought || !x.amount);
        const next = sorted[0]?.obj;
        const nextWait = active.find(x => Game.cookies >= x.price * options.buildingWait);
        const nextNew = active.find(x => x.price <= Game.cookies);
        let nextHighValue = sorted.find(item =>
            !item.obj.locked && item.obj.amount == 0 && item.obj.price <= Game.cookies
        )?.obj;
        nextHighValue ||= sorted.slice(1, 7).find((item, index) => {
            return sorted[0].price <= Game.cookies &&
                item.relativeValue - sorted[0].relativeValue >= 10 + (2.5 ** (index + 2));
        }) && sorted[0].obj;

        const result: GetOrdersResult = [];

        if (nextNew) {
            result.push({
                type: 'buy',
                ratio: (Game.cookies ** 6) / nextNew.price,
                cookies: nextNew.price,
                buy: () => this.context.buy(nextNew),
                log: () => ({
                    msg: `🏛 Bought new building type: ${nextNew.name}`
                }),
            });
        }

        if (nextHighValue) {
            const building = nextHighValue;
            const amount = getAffordableBuildingMultiple(building, [50, 40, 30, 20, 10, 1])!
            const price = building.price * amount;

            result.push({
                type: 'buy',
                ratio: (Game.cookies ** 5) / price, // much higher importance
                cookies: price,
                buy: () => this.context.buy(building, amount),
                log: () => ({
                    msg: `💰 So cheap it just can't wait: Bought ${building.name} ✕ ${amount}`
                }),
            });
        }

        if (nextWait) {
            result.push({
                type: 'wait',
                ratio: Game.cookies / nextWait.price,
                cookies: nextWait.price,
                log: () => ({
                    msg: `🟡 Waiting to buy new building type: ${nextWait.name}`,
                    eta: this.getEta(nextWait.price),
                }),
            });
        }

        if (next) {
            if (next.price <= Game.cookies) {
                result.push({
                    type: 'buy',
                    ratio: Game.cookies / next.price,
                    cookies: next.price,
                    buy: () => this.context.buy(next),
                    log: () => ({
                        msg: `🏛 Bought building: ${next.name}`
                    }),
                });
            } else if (!result.length) {
                result.push({
                    type: 'wait',
                    ratio: Game.cookies / next.price,
                    cookies: next.price,
                    log: () => ({
                        msg: `⏲ Waiting to buy building: ${next.name}`,
                        eta: this.getEta(next.price),
                    }),
                });
            }
        }

        return result;
    }

    getSortedBuildings(): BuildingMeta[] {
        const sorted: BuildingMeta[] = Game.ObjectsById
            .filter(x => !x.locked)
            .map((obj, index) => ({
                name: obj.name,
                price: obj.price,
                cps: this.context.getCps(obj.name),
                pricePerCps: Math.max(0.01, Math.round(obj.price / this.context.getCps(obj.name))),
                index,
                obj,
                relativeValue: 0, // overwritten bellow
            }))
            .filter(obj => obj.cps)
            .sort((a, b) => a.pricePerCps - b.pricePerCps);

        const min = sorted[0]?.pricePerCps || 1;
        for (const obj of sorted) {
            obj.relativeValue = Math.round(obj.pricePerCps / min * 10) / 10;
        }

        return sorted;
    }
}
