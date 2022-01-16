import options from 'src/options';
import { Building, BuildingMeta } from 'src/typeDefs';
import { formatAmount, Game, getAffordableBuildingMultiple, getCostOfNBuildings } from 'src/utils';
import Buyer, { BuyOrder, GetOrdersResult } from './Buyer';

export default class BuildingBuyer extends Buyer {
    scale(x: number) { return x ** 1.5; }

    getOrders(): NonNullable<GetOrdersResult> {
        const sorted = this.getSortedBuildings();
        const active = Game.ObjectsById.filter(x => !x.bought || !x.amount);
        const next = sorted[0];
        const nextWait = active.find(x => Game.cookies >= x.price * options.buildingWait);
        const nextNew = active.find(x => x.price <= Game.cookies);
        let nextHighValue = sorted.find(item =>
            !item.locked && item.amount == 0 && item.price <= Game.cookies
        );
        nextHighValue ||= sorted.slice(1, 7).find((item, index) => {
            return sorted[0].price <= Game.cookies &&
                item.relativeValue - sorted[0].relativeValue >= 10 + (2.5 ** (index + 2));
        }) && sorted[0];

        const result: GetOrdersResult = [
            ...this.getThresholdOrders(sorted),
        ];

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
            const amount = getAffordableBuildingMultiple(
                nextHighValue,
                [600, 500, 400, 300, 200, 100, 50, 40, 30, 20, 10, 1]
            ) || 1;
            const price = nextHighValue.price * amount;

            result.push({
                type: 'buy',
                ratio: (Game.cookies ** 5) / price, // much higher importance
                cookies: price,
                buy: () => this.context.buy(nextHighValue!.building, amount),
                log: () => ({
                    msg: `💰 So cheap it just can't wait: Bought ${nextHighValue!.name} ✕ ${amount}`
                }),
            });
        }

        if (nextWait) {
            result.push({
                type: 'wait',
                ratio: (Game.cookies ** 3) / nextWait.price,
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
                    buy: () => this.context.buy(next.building),
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

    getThresholdOrders(sorted: BuildingMeta[]): BuyOrder<{ ratio: number }>[] {
        if (Game.cookiesPs < 1e3) return [];

        const active: Array<{
            obj: BuildingMeta;
            toBuy: number;
            amount: number;
            price: number;
        }> = [];

        for (const obj of sorted) {
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

        if (!next) return [];

        const base = {
            ratio: Game.cookies / next.price,
            cookies: next.price,
        };

        if (next.price <= Game.cookies) {
            return [
                {
                    type: 'buy',
                    ...base,
                    buy: () => this.context.buy(next.obj.building, next.toBuy),
                    log: () => ({
                        msg: `🚀 To the moon: Bought from ${next.obj.amount} → ${next.amount} of ${next.obj.name}`,
                    }),
                }
            ];
        }

        if (next.price * 0.8 <= Game.cookies) {
            return [
                {
                    type: 'wait',
                    ...base,
                    log: () => ({
                        msg: `🟡 Waiting to buy to threshold for ${next.obj.name} - ${formatAmount(next.price)}`,
                        eta: this.getEta(next.price),
                    }),
                }
            ];
        }

        return [];
    }

    getBuildingPrice(building: Building) {
        if (Game.cookiesPs > 1e9) {
            //  buildings that are primarily used for sacrifice are much less appealling
            if (options.pantheon.sellForRuin.includes(building.name)) {
                return building.price * 1e5;
            }
        }

        return building.price;
    }

    getSortedBuildings(): BuildingMeta[] {
        const sorted: BuildingMeta[] = Game.ObjectsById
            .filter(x => !x.locked)
            .map(obj => {
                const price = this.getBuildingPrice(obj);
                return {
                    name: obj.name,
                    price,
                    bought: obj.bought,
                    locked: obj.locked,
                    amount: obj.amount,
                    basePrice: obj.basePrice * (price / obj.price),
                    cps: this.context.getCps(obj.name),
                    pricePerCps: Math.max(0.01, Math.round(price / this.context.getCps(obj.name))),
                    relativeValue: 0, // overwritten bellow
                    building: Game.Objects[obj.name],
                };
            })
            .filter(obj => obj.cps)
            .sort((a, b) => a.pricePerCps - b.pricePerCps);

        const min = sorted[0]?.pricePerCps || 1;
        for (const obj of sorted) {
            obj.relativeValue = Math.round(obj.pricePerCps / min * 10) / 10;
        }

        return sorted;
    }
}
