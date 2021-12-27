import Timer from 'src/Timer';
import { cleanHTML, formatAmount, Game } from 'src/utils';

export default class BuyTimer extends Timer {
    execute() {
        console.clear();
        const context = this.context;
        let timeout = 1000;
        context.cpsCache = {};

        if (context.upgradeFatigue > 0 && Game.cookiesPs >= 1e13) {
            context.upgradeFatigue = 0;
        }

        const buildings = context.getBuildingStats();
        const upgrades = context.getUpgradeStats();
        const santa = context.getSantaStats();
        const threshold = context.getAchievementThresholdStats();
        const dragon = context.getDragonStats();
        const getEta = (targetCookies: number) => {
            if (targetCookies <= Game.cookies) return undefined;
            return (targetCookies - Game.cookies) / context.realCps;
        }

        const run = () => {
            if (buildings.nextHighValue) {
                const { obj, amount } = buildings.nextHighValue;
                context.buy(obj, amount);
                return context.log(`💰 So cheap it just can't wait: Bought ${obj.name} ✕ ${amount}`);
            }

            if (dragon.buy) {
                context.buy({ name: 'dragon', buy: () => Game.UpgradeDragon() });
                context.log(`🔥 Trained your dragon for the low low cost of ${dragon.buy.costStr()} \n(${dragon.buy.action}) `);
                return
            }

            if (dragon.wait) {
                const { lvl, goal } = dragon.wait;
                if (Game.cookies >= goal.cookies) {
                    switch (goal.type) {
                        case 'cookie': break;
                        case 'building': {
                            const toBuy = goal.amount - Game.Objects[goal.value].amount;
                            const obj = Game.Objects[goal.value];
                            context.log(`🐲 Bought ${toBuy} ✕ ${obj.name} to feed to the dragon`);
                            context.buy(obj, toBuy);
                            break;
                        }
                        case 'all':
                            console.warn('context will totally fuck up everything yo');
                            break;
                    }
                } else {
                    context.log(`🐲 Raising cookies to feed the dragon, need ${formatAmount(goal.cookies)} to get ${lvl.costStr()}`, { eta: getEta(goal.cookies) });
                }
                return;
            }

            if (upgrades.next) {
                context.buy(upgrades.next);
                timeout *= 5;
                return context.log(
                    `💹 Bought new upgrade: ${upgrades.next.name}\n(${cleanHTML(upgrades.next.desc)})`,
                    { color: 'lightgreen' }
                );
            }

            if (upgrades.nextWait) {
                timeout *= 10;
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
                timeout *= 10;
                return;
            }

            if (santa.buy) {
                context.buy({ buy: () => Game.UpgradeSanta() });
                timeout *= 5;
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
                timeout *= 10;
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
                timeout *= 5;
                return
            }

            context.log("You're too poor... but that's a good thing!");
            timeout *= 5;
        }

        run();

        context.printLog({ buildings });

        return timeout;
    }
}
