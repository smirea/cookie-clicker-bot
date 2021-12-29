import Timer from 'src/Timer';
import { Building } from 'src/typeDefs';
import { fixMenuBug, formatAmount, Game } from 'src/utils';

export default class BuyTimer extends Timer {
    type = 'default' as const;

    defaultTimeout = 500;

    execute(): void {
        this.context.cpsCache = {};
        const buildings = this.context.getBuildingStats();
        this.context.lastState.buildings = buildings;

        if (this.context.upgradeFatigue > 0 && Game.cookiesPs >= 1e10) {
            this.context.upgradeFatigue = 0;
        }

        this.decisionTree();
    }

    decisionTree() {
        const context = this.context;
        const { buildings } = context.lastState;
        const upgrades = context.getUpgradeStats();
        const santa = context.getSantaStats();
        const threshold = context.getAchievementThresholdStats();
        const dragon = context.getDragonStats();
        const getEta = (targetCookies: number) => {
            if (targetCookies <= Game.cookies) return undefined;
            return (targetCookies - Game.cookies) / context.realCps;
        }
        const waitMultiple = (multiple: number) => {
            if (Game.cookiesPs < 1e3) multiple = 1;
            else if (Game.cookiesPs < 1e5) multiple = Math.max(1, multiple / 3);

            this.scaleTimeout(multiple);
        }

        if (Game.cookiesPs > 10e12) this.defaultTimeout = 100;

        if (buildings.nextHighValue) {
            const { obj, amount } = buildings.nextHighValue;
            context.buy(obj, amount);
            return context.log(`💰 So cheap it just can't wait: Bought ${obj.name} ✕ ${amount}`);
        }

        if (dragon.buy) {
            context.buy({ name: 'dragon', buy: () => Game.UpgradeDragon() });
            context.log(
                `🔥 Trained your dragon for the low low cost of ${dragon.buy.costStr()} \n(${dragon.buy.action})`,
                { color: 'orange' }
            );
            fixMenuBug();
            return
        }

        if (dragon.wait) {
            const { lvl, goal } = dragon.wait;
            if (Game.cookies >= goal.cookies) {
                const buyToAmount = (building: Building) => {
                    if (building.amount >= goal.amount) return;
                    const toBuy = goal.amount - building.amount;
                    context.buy(building, toBuy);
                    context.log(`🐲 Bought ${toBuy} ✕ ${building.name} to feed to the dragon`);
                };

                switch (goal.type) {
                    case 'cookie': break;
                    case 'building':
                        buyToAmount(Game.Objects[goal.value]);
                        break;
                    case 'all':
                        for (const building of Array.from(Game.ObjectsById).reverse()) {
                            buyToAmount(building);
                        }
                        break;
                }
            } else {
                context.log(`🐲 Raising cookies to feed the dragon, need ${formatAmount(goal.cookies)} to get ${lvl.costStr()}`, { eta: getEta(goal.cookies) });
            }
            return;
        }

        if (upgrades.next) {
            context.buy(upgrades.next);
            return context.log(
                `💹 Bought new upgrade: ${upgrades.next.name}\n(${upgrades.next.desc})`,
                { color: 'lightgreen' }
            );
        }

        if (upgrades.nextWait) {
            waitMultiple(10);
            context.log(
                `🟡 Waiting to buy new upgrade: ${upgrades.nextWait.name}`,
                { eta: getEta(upgrades.nextWait.getPrice()), extra: upgrades.waitPct }
            );
            return;
        }

        if (threshold?.available) {
            const { obj, toBuy, nextAmount } = threshold;
            const { amount } = obj;
            context.buy(obj, toBuy);
            context.log(`🚀 To the moon: Bought from ${amount} → ${nextAmount} of ${obj.name}`);
            return;
        }

        if (threshold?.wait) {
            context.log(
                `🟡 Waiting to buy to threshold for ${threshold.obj.name} - ${formatAmount(threshold.nextPrice)}`,
                { eta: getEta(threshold.nextPrice) }
            );
            waitMultiple(10);
            return;
        }

        if (santa.buy) {
            context.buy({ buy: () => Game.UpgradeSanta() });
            fixMenuBug();
            return context.log('🎅 Ho Ho Ho!');
        }

        if (santa.wait) {
            return context.log(`🎅 Twas the night before X-MAS!`, { eta: getEta(santa.price) });
        }

        if (buildings.nextNew) {
            context.buy(buildings.nextNew);
            context.log(`🏛 Bought new building type: ${buildings.nextNew.name}`);
            return;
        }

        if (buildings.nextWait) {
            context.log(
                `🟡 Waiting to buy new building type: ${buildings.nextWait.name}`,
                { eta: getEta(buildings.nextWait.price) }
            );
            waitMultiple(10);
            return;
        }

        if (buildings.next) {
            if (buildings.next.price <= Game.cookies) {
                context.buy(buildings.next);
                context.log(`🏛 Bought building: ${buildings.next.name}`);
                return
            }
            context.log(
                `⏲ Waiting to buy building: ${buildings.sorted[0]?.name}`,
                { eta: getEta(buildings.sorted[0].price) }
            );
            return
        }

        context.log("You're too poor... but that's a good thing!");
        waitMultiple(5);
    }
}
