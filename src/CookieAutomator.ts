import type { Building, BuildingName, Buyable, Upgrade } from './typeDefs';
import { $, formatAmount, formatDuration, Game, global } from './utils';
import packageJson from '../package.json';

export default class CookieAutomator {
    options = {
        cookieClickTimeout: 1000 / 15.1, // sneaky
        showLogs: 20,
        buildingWait: 0.35, // what % [0-1] of the building price to start waiting to buy
        upgradeWait: 0.20, // what % [0-1] of the upgrade price to start waiting to buy
    };
    logMessages: LogMessage[];
    private timers: Record<string, NodeJS.Timeout> = {};
    achievementThresholds: Record<string, number[]> = {
        Cursor: [1, 2, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        Default: [1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600],
    };
    upgradeFatigue = 1; // prevent buying too many updates one after another
    _cpsCache: { [key in BuildingName]?: number } = {};

    constructor() {
        let existingLog = [];
        try {
            existingLog = JSON.parse(localStorage.CookieAutomator_logMessages);
        } catch (ex) {}
        this.logMessages = global.__automateLog = global.__automateLog || existingLog;
        this.options.cookieClickTimeout = Math.max(5, this.options.cookieClickTimeout);
    }

    start() {
        this.clickBigCookieTimer();
        this.maybeClickLumpTimer();
        this.shimmerTimer();
        this.buyTimer();
        this.timers.saveLog = setInterval(() => {
            localStorage.CookieAutomator_logMessages = JSON.stringify(this.logMessages.slice(-100));
        }, 2e3);
    }

    stop() {
        for (const x of Object.values(this.timers)) {
            clearTimeout(x);
            clearInterval(x);
        }
    }

    get realCps() {
        return Game.cookiesPs + Game.computedMouseCps * (1000 / this.options.cookieClickTimeout);
    }

    log(msg: string, extra?: string) {
        const last = this.logMessages[this.logMessages.length - 1];
        if (last && last.msg === msg) {
            ++last.count;
            last.extra = extra;
        } else this.logMessages.push({ time: Date.now(), msg, count: 1, extra });

        if (this.logMessages.length > 1000) {
            this.logMessages.splice(0, this.logMessages.length - 1000);
        }
    }

    buy(obj: Pick<Buyable, 'buy'>, amount = 1) {
        if ((obj as Upgrade).type === 'upgrade') {
            this.upgradeFatigue = Math.min(this.upgradeFatigue + 2, 10);
        } else {
            this.upgradeFatigue = Math.max(this.upgradeFatigue - 0.2 * amount, 1);
        }

        return obj.buy(amount);
    }

    maybeClickLumpTimer() {
        if ((Date.now() - Game.lumpT) / 1000 / 3600 < 23) return;
        Game.clickLump();
    }

    shimmerTimer() {
        $('.shimmer')?.click();
        this.timers.shimmerTimer = setTimeout(() => { this.shimmerTimer(); }, 3000);
    }

    clickBigCookieTimer() {
        $('#bigCookie')?.click();
        this.timers.clickBigCookieTimer = setTimeout(
            () => this.clickBigCookieTimer(),
            this.options.cookieClickTimeout
        );
    }

    getCps(name: BuildingName): number {
        this._cpsCache = this._cpsCache || {};
        if (this._cpsCache[name]) return this._cpsCache[name]!;

        const obj = Game.Objects[name];
        const tooltip = obj.tooltip();
        const match = tooltip.replace(/,/g, '')
            .replace(/\d+(\.\d+)?\s+million/gi, x => String(parseFloat(x) * 1e6))
            .replace(/\d+(\.\d+)?\s+billion/gi, x => String(parseFloat(x) * 1e9))
            .replace(/\d+(\.\d+)?\s+trillion/gi, x => String(parseFloat(x) * 1e12))
            .replace(/\d+(\.\d+)?\s+quadrillion/gi, x => String(parseFloat(x) * 1e15))
            .replace(/\d+(\.\d+)?\s+quintillion/gi, x => String(parseFloat(x) * 1e18))
            .match(/produces <b>([^c]+) cookies/) || [];
        let cps = parseFloat(match[1] || '');

        if (Number.isNaN(cps)) return obj.bought ? obj.baseCps : 0;

        if (obj.name === 'Grandma') {
            for (const x of Game.ObjectsById) {
                if (x.name === 'Grandma') continue;
                if (!x.grandma?.bought) continue;
                const match = x.grandma.desc.match(/gain <b>\+(\d+).*<\/b> per (\d+)? grandma/i) || [];
                const pct = parseFloat(match[1]);
                const multiplier = parseInt(match[2] || '1', 10);
                if (!pct || !multiplier || Number.isNaN(pct) || Number.isNaN(multiplier)) continue;
                const childCps = x.cps(x);
                cps = cps + childCps * (pct / 100) * Math.floor(Game.Objects.Grandma.amount / multiplier);
            }
        }

        this._cpsCache[name] = cps;

        return cps;
    }

    getBuildingStats() {
        const sorted = Game.ObjectsById
            .map((obj, index) => ({
                name: obj.name,
                price: obj.price,
                cps: this.getCps(obj.name),
                pricePerCps: Math.round(obj.price / this.getCps(obj.name)),
                index,
                obj,
                relativeValue: 0, // overwritten bellow
            }))
            .filter(obj => obj.cps)
            .sort((a, b) => a.pricePerCps - b.pricePerCps);
        const min = sorted[0]?.pricePerCps || 1;

        // {
        //     const table = {};
        //     for (const item of Array.from(sorted).sort((a, b) => a.index - b.index)) {
        //         table[item.name] = {
        //             cps: item.cps,
        //             price: item.price,
        //             pricePerCps: item.pricePerCps,
        //         };
        //     }
        //     console.table(table);
        // }

        for (const obj of sorted) {
            obj.relativeValue = Math.round(obj.pricePerCps / min * 10) / 10;
        }

        const active = Game.ObjectsById.filter(x => !x.locked && !x.bought);
        const next = sorted[0]?.obj;
        const nextWait = active.find(x => Game.cookies >= x.price * this.options.buildingWait);
        const nextNew = active.find(x => x.price <= Game.cookies);
        const nextHighValue = sorted.slice(1).find((item, index) => {
            return sorted[0].price <= Game.cookies &&
                item.relativeValue - sorted[0].relativeValue >= 10 + (2.5 ** (index + 2));
        }) ? sorted[0].obj : null;

        return {
            next,
            nextNew,
            nextWait,
            nextHighValue,
            sorted,
        };
    }

    getUpgradeStats() {
        const getPrice = (upg: Upgrade) => { // takes into account willingness factor, used for sorting
            let result = upg.getPrice();
            if (/cookie production multiplier/i.test(upg.desc)) result *= 1.5;
            else if (/clicking gains/i.test(upg.desc)) result *= 0.8;
            else if (/grandmas|twice/i.test(upg.desc)) result *= 0.6;
            return result;
        }
        const active = Object.values(Game.Upgrades)
            .filter(x => !x.bought && x.unlocked)
            .sort((a, b) => getPrice(a) - getPrice(b));
        const next = active.find(x => x.canBuy());
        const nextWait = Game.cookies >= 30e3 && active.find(x =>
            !x.canBuy() &&
            Game.cookies >= x.getPrice() * this.options.upgradeWait * this.upgradeFatigue
        );

        return { next, nextWait };
    }

    getSantaStats() {
        const price = Math.pow(Game.santaLevel + 1, Game.santaLevel + 1);
        const buy = Game.cookies >= price && Game.santaLevel < 14;
        const wait = !buy && Game.cookies >= price * 0.75 && Game.santaLevel < 14;

        return { wait, buy, price };
    }

    getAchievementThresholdStats() {
        const options = [];
        const getNCost = (obj: Building, end: number) =>
            obj.basePrice * (1.15 ** end - 1.15 ** obj.amount) / 0.15;

        for (const obj of Game.ObjectsById) {
            if (!obj.bought || obj.amount <= 1) continue;
            const ranges = this.achievementThresholds[obj.name] || this.achievementThresholds.Default;
            if (obj.amount >= ranges[ranges.length - 1]) continue;
            const index = ranges.findIndex((start, i) => start <= obj.amount && obj.amount < ranges[i + 1]);
            const nextAmount = ranges[index + 1];
            const nextPrice = getNCost(obj, nextAmount);
            const toBuy = nextAmount - obj.amount;
            options.push({
                obj,
                toBuy,
                nextAmount,
                nextPrice,
                available: nextPrice <= Game.cookies,
                wait: Game.cookies >= nextPrice * 0.8,
            });
        }

        options.sort((a, b) => a.nextPrice - b.nextPrice);
        return options[0];
    }

    buyTimer() {
        this._cpsCache = {};
        let timeout = 1000;
        const buildings = this.getBuildingStats();
        const upgrades = this.getUpgradeStats();
        const santa = this.getSantaStats();
        const threshold = this.getAchievementThresholdStats();
        const waitTime = (targetCookies: number) => {
            if (targetCookies <= Game.cookies) return 'SOON!';
            return 'ETA: ' + formatDuration((targetCookies - Game.cookies) / this.realCps);
        }

        const run = () => {
            console.clear();

            if (buildings.nextHighValue) {
                this.buy(buildings.nextHighValue);
                return this.log(`💲 So cheap it just can't wait: ${buildings.nextHighValue.name}`);
            }

            if (upgrades.next) {
                this.buy(upgrades.next);
                const desc = upgrades.next.desc.replace(/<q>.*<\/q>/g, '').replace(/<.>([^<]+)<\/.>/g, '$1');
                return this.log(`📈 Bought new upgrade: ${upgrades.next.name}\n(${desc})`);
            }

            if (upgrades.nextWait) {
                timeout *= 10;
                this.log(
                    `🟡 Waiting to buy new upgrade: ${upgrades.nextWait.name}`,
                    waitTime(upgrades.nextWait.getPrice())
                );
                return;
            }

            if (threshold.available) {
                const { obj, toBuy, nextAmount } = threshold;
                const { amount } = obj;
                this.buy(obj, toBuy);
                this.log(`🚀 To the moon: Bought from ${amount} → ${nextAmount} of ${obj.name}`);
                return;
            }

            if (threshold.wait) {
                this.log(
                    `🟡 Waiting to buy to threshold for ${threshold.obj.name} - ${formatAmount(threshold.nextPrice)}`,
                    waitTime(threshold.nextPrice)
                );
                return;
            }

            if (santa.buy) {
                this.buy({ buy: () => Game.UpgradeSanta() });
                return this.log('🎅 Ho Ho Ho!');
            }

            if (santa.wait) {
                return this.log(`🎅 Twas the night before X-MAS!`, waitTime(santa.price));
            }

            if (buildings.nextNew) {
                this.buy(buildings.nextNew);
                this.log(`🏛 Bought new building type: ${buildings.nextNew.name}`);
                return;
            }

            if (buildings.nextWait) {
                this.log(
                    `🟡 Waiting to buy new building type: ${buildings.nextWait.name}`,
                    waitTime(buildings.nextWait.price)
                );
                timeout *= 10;
                return;
            }

            if (buildings.next) {
                if (buildings.next.price <= Game.cookies) {
                    this.buy(buildings.next);
                    this.log(`🏛 Bought building: ${buildings.next.name}`);
                    return
                }
                this.log(
                    `⏲ Waiting to buy building: ${buildings.sorted[0]?.name}`,
                    waitTime(buildings.sorted[0].price)
                );
                timeout *= 5;
                return
            }

            this.log("💰 You're too poor... but that's a good thing!");
            timeout *= 5;
        }

        run();
        this.printLog({ buildings });
        this.timers.buyTimer = setTimeout(() => this.buyTimer(), timeout);
    }

    printLog({ buildings }: {
        buildings: ReturnType<typeof CookieAutomator['prototype']['getBuildingStats']>;
    }) {
        console.log('%c%s v%s', 'color:gray', packageJson.name, packageJson.version);
        console.log('%cBuy Order:', 'font-weight:bold');
        for (const obj of buildings.sorted) {
            console.log('   - %s: %sx', obj.name, obj.relativeValue);
        }

        console.log(`upgradeFatigue: ${Math.round(this.upgradeFatigue * 100) / 100}x`);
        console.log('%cLast %d log messages (window.__automateLog):', 'font-weight:bold', this.options.showLogs);
        for (const { time, msg, count, extra } of this.logMessages.slice(-1 * this.options.showLogs)) {
            console.log(
                '%c%s%c %s %c%s %c%s',
                'color:gray',
                new Date(time).toISOString().slice(11, 19),
                'color:white',
                msg,
                'color:gray',
                count > 1 ? `✕ ${count}` : '',
                'color:gray',
                extra ? '| ' + extra : '',
            );
        }
    }
}
