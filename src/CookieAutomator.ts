import type {
    Building,
    BuildingName,
    Buyable,
    DragonLevel,
    DragonLevelGoal,
    Upgrade,
} from './typeDefs';
import { $, formatAmount, formatDuration, Game, getAffordableBuildingMultiple, getCostOfNBuildings, global } from './utils';
import packageJson from '../package.json';
import options from './options';
import type Timer from './Timer';
import BuyTimer from './timers/BuyTimer';
import ClickCookieTimer from './timers/ClickCookieTimer';
import DragonAuraTimer from './timers/DragonAuraTimer';
import LogTimer from './timers/LogTimer';
import PageReloadTimer from './timers/PageReloadTimer';
import ShimmerTimer from './timers/ShimmerTimer';
import SugarLumpTimer from './timers/SugarLumpTimer';
import WrinklerTimer from './timers/WrinklerTimer';
import BuildingStats from './typeDefs';

export default class CookieAutomator {
    logMessages: LogMessage[];
    upgradeFatigue = 1; // prevent buying too many updates one after another
    cpsCache: { [key in BuildingName]?: number } = {};
    startDate!: number;
    timers: Timer[] = [
        new BuyTimer(this),
        new ClickCookieTimer(this),
        new DragonAuraTimer(this),
        new LogTimer(this),
        new PageReloadTimer(this),
        new ShimmerTimer(this),
        new SugarLumpTimer(this),
        new WrinklerTimer(this),
    ];

    constructor() {
        options.cookieClickTimeout = Math.max(5, options.cookieClickTimeout);

        let existingLog = [];
        try {
            existingLog = JSON.parse(localStorage[options.localStorage.log]);
        } catch (ex) {}
        this.logMessages = global.__automateLog = global.__automateLog || existingLog;
    }

    start() {
        this.stop();
        this.startDate = Date.now();
        for (const timer of this.timers) timer.start();
    }

    stop() {
        for (const timer of this.timers) timer.stop();
    }

    reset() {
        this.stop();
        for (const key in options.localStorage) delete localStorage[key];
        location.reload();
    }

    get realCps() {
        return Math.round(Game.cookiesPs + Game.computedMouseCps * (1000 / options.cookieClickTimeout));
    }

    log(msg: string, { eta, extra, color }: Pick<LogMessage, 'color' | 'extra' | 'eta'> = {}) {
        const last = this.logMessages[this.logMessages.length - 1];
        if (last && last.msg === msg) {
            ++last.count;
            last.extra = extra;
            last.eta = eta;
        } else {
            if (last) {
                if (last.eta && last.eta < 30e3) delete last.eta;
                delete last.extra;
            }
            this.logMessages.push({ time: Date.now(), msg, count: 1, eta, extra, color });
        }

        if (this.logMessages.length > 1000) {
            this.logMessages.splice(0, this.logMessages.length - 1000);
        }
    }

    getBuffs() {
        let cpsMultiple = 1;
        for (const buff of Object.values(Game.buffs)) {
            if (!buff.visible || !buff.multCpS) continue;
            cpsMultiple *= buff.multCpS;
        }
        return { cpsMultiple };
    }

    getActiveWrinklers() {
        return Game.wrinklers.filter(x => x.hp > 0);
    }

    getAvailableDragonAuras() {
        const auras = [];
        for (const i in Game.dragonAuras) {
            const aura = Game.dragonAuras[i];
            const index = parseInt(i);
            if (Game.dragonLevel >= index + 4) {
                auras.push({ ...aura, index, level: index + 4 })
            }
        }
        auras.sort((a, b) => a.index - b.index);
        return {
            byIndex: auras,
            byName: Object.fromEntries(auras.map(x => [x.name, x])),
        };
    }

    buy(obj: { name?: string; buy: Buyable['buy']; [key: string]: any }, amount = 1) {
        if (typeof amount === 'number' && amount < 1) {
            console.warn('[CookieAutomator.buy()] Cannot get <1 amount: %s of %s', amount, (obj as any).name)
            return;
        }

        if (this.upgradeFatigue) {
            if ((obj as Upgrade).type === 'upgrade') {
                const increment = Math.min(2, 0.5 + Math.floor(Game.cookiesPs / 100) / 10);
                this.upgradeFatigue = Math.min(this.upgradeFatigue + increment, 10);
            } else {
                this.upgradeFatigue = Math.max(this.upgradeFatigue - 0.2 * amount, 1);
            }
        }

        return obj.buy(amount);
    }

    getCps(name: BuildingName): number {
        this.cpsCache = this.cpsCache || {};
        if (this.cpsCache[name]) return this.cpsCache[name]!;

        const obj = Game.Objects[name];
        const tooltip = obj.tooltip();
        const match = tooltip.replace(/,/g, '')
            .replace(/\d+(\.\d+)?\s+million/gi, x => String(parseFloat(x) * 1e6))
            .replace(/\d+(\.\d+)?\s+billion/gi, x => String(parseFloat(x) * 1e9))
            .replace(/\d+(\.\d+)?\s+trillion/gi, x => String(parseFloat(x) * 1e12))
            .replace(/\d+(\.\d+)?\s+quadrillion/gi, x => String(parseFloat(x) * 1e15))
            .replace(/\d+(\.\d+)?\s+quintillion/gi, x => String(parseFloat(x) * 1e18))
            .replace(/\d+(\.\d+)?\s+sextillion/gi, x => String(parseFloat(x) * 1e21))
            .replace(/\d+(\.\d+)?\s+septillion/gi, x => String(parseFloat(x) * 1e24))
            .replace(/\d+(\.\d+)?\s+octillion/gi, x => String(parseFloat(x) * 1e27))
            .replace(/\d+(\.\d+)?\s+nonillion/gi, x => String(parseFloat(x) * 1e30))
            .replace(/\d+(\.\d+)?\s+decillion/gi, x => String(parseFloat(x) * 1e33))
            .match(/produces <b>([^c]+) cookies/) || [];
        let cps = parseFloat(match[1] || '');

        // @TODO: figure out a better way instead of obj.baseCps, it's way too low
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

        this.cpsCache[name] = cps;

        return cps;
    }

    getBuildingStats(): BuildingStats {
        const sorted: BuildingStats['sorted'] = Game.ObjectsById
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
        const nextWait = active.find(x => Game.cookies >= x.price * options.buildingWait);
        const nextNew = active.find(x => x.price <= Game.cookies);
        const nextHighValue = sorted.slice(1).find((item, index) => {
            return sorted[0].price <= Game.cookies &&
                item.relativeValue - sorted[0].relativeValue >= 10 + (2.5 ** (index + 2));
        }) ? sorted[0].obj : null;

        return {
            next,
            nextNew,
            nextWait,
            nextHighValue: nextHighValue
                ? {
                    obj: nextHighValue,
                    amount: getAffordableBuildingMultiple(nextHighValue, [50, 40, 30, 20, 10, 1])!,
                }
                : null,
            sorted,
        };
    }

    getUpgradeStats() {
        const getPrice = (upg: Upgrade) => { // takes into account willingness factor, used for sorting
            let result = upg.getPrice();
            if (/cookie production multiplier/i.test(upg.desc)) result *= 1.2;
            else if (/clicking gains/i.test(upg.desc)) result *= 0.8;
            else if (/grandmas|twice/i.test(upg.desc)) result *= 0.6;
            return result;
        }
        const active = Object.values(Game.Upgrades)
            .filter(x => !x.bought && x.unlocked && !options.bannedUpgrades[x.name])
            .sort((a, b) => getPrice(a) - getPrice(b));
        const next = active[0]?.canBuy() ? active[0] : null;
        const waitPrice = active[0]?.getPrice() * options.upgradeWait * (this.upgradeFatigue || 1);
        const nextWait = (
            active[0] && Game.cookies >= 30e3 && Game.cookies >= waitPrice
                ? active[0]
                : null
        );
        const waitPct = nextWait && (Math.round(Game.cookies / active[0].getPrice() * 100) + '%') || undefined;

        return { next, nextWait, waitPct };
    }

    getSantaStats() {
        const price = Math.pow(Game.santaLevel + 1, Game.santaLevel + 1);

        if (
            Game.santaLevel >= 14 ||
            // ho ho hold on a bit
            (price > 30 && Game.cookiesPs < 1000)
        ) return { wait: null, buy: null, price: 0 };

        const buy = Game.cookies >= price;
        const wait = !buy && Game.cookies >= price * 0.75;

        return { wait, buy, price };
    }

    getAchievementThresholdStats() {
        const active = [];

        for (const obj of Game.ObjectsById) {
            if (!obj.bought || obj.amount <= 1) continue;
            const ranges = options.achievementThresholds[obj.name] || options.achievementThresholds.Default;
            if (obj.amount >= ranges[ranges.length - 1]) continue;
            const index = ranges.findIndex((start, i) => start <= obj.amount && obj.amount < ranges[i + 1]);
            const nextAmount = ranges[index + 1];
            const nextPrice = getCostOfNBuildings(obj, nextAmount);
            const toBuy = nextAmount - obj.amount;
            active.push({
                obj,
                toBuy,
                nextAmount,
                nextPrice,
                available: nextPrice <= Game.cookies,
                wait: Game.cookies >= nextPrice * 0.8,
            });
        }

        if (!active.length) return null;

        active.sort((a, b) => a.nextPrice - b.nextPrice);
        return active[0];
    }

    getDragonStats(): { buy?: DragonLevel; wait?: { lvl: DragonLevel; goal: DragonLevelGoal } } {
        if (Game.cookiesPs < 1e5 || Game.dragonLevel >= Game.dragonLevels.length - 1) {
            return {};
        }

        if (this.getAvailableDragonAuras().byName[options.dragon.auras[0]]) {
            return {}; // you've trained your dragon
        }

        const lvl = Game.dragonLevels[Game.dragonLevel];
        if (lvl.cost()) return { buy: lvl };

        const match = lvl.costStr().match(/^(\d+) (.*)$/) || [];
        const amount = parseInt(match[1]);
        const unit = match[2];

        if (!amount || Number.isNaN(amount) || !unit) {
            console.warn('[CookieAutomator:getDragonStats()] Cannot parse: %s', lvl.costStr());
            return {};
        }

        const handlers: Record<string, () => DragonLevelGoal> = {
            'million cookies': () => ({ type: 'cookie', amount, cookies: amount }) as const,
            'of every building': () => ({
                type: 'all',
                amount,
                cookies: Game.ObjectsById
                    .map(obj => getCostOfNBuildings(obj, amount))
                    .reduce((s, x) => s + x, 0),
            }) as const,
        };

        for (const obj of Game.ObjectsById) {
            handlers[obj.plural] = () => ({
                type: 'building',
                value: obj.name,
                amount,
                cookies: getCostOfNBuildings(obj, amount),
            }) as const;
        }

        if (!handlers[unit]) {
            console.warn('[CookieAutomator:getDragonStats()] Unknown unit: %s', lvl.costStr());
            return {};
        }

        const goal = handlers[unit]();

        if (Game.cookies >= goal.cookies * options.dragon.waitRatios[goal.type]) {
            return { wait: { lvl, goal } };
        }

        return {};
    }

    printLog({ buildings }: { buildings: BuildingStats; }) {
        console.log('%c%s v%s', 'color:gray', packageJson.name, packageJson.version);
        console.log(
            `upgradeFatigue: %s | realCps: %s`,
            this.upgradeFatigue ? Math.round(this.upgradeFatigue * 100) / 100 + 'x' : 'disabled',
            formatAmount(this.realCps)
        );
        console.log('%cBuy Order:', 'font-weight:bold');
        for (const obj of buildings.sorted) {
            console.log('   - %s: %sx', obj.name, obj.relativeValue);
        }
        // console.log('%cLast %d log messages (window.__automateLog):', 'font-weight:bold', options.showLogs);
        for (const { time, msg, count, eta, extra, color = 'white' } of this.logMessages.slice(-1 * options.showLogs)) {
            console.log(
                `%c%s%c %s %c%s`,
                'color:gray',
                new Date(time).toISOString().slice(11, 19),
                `color:${color}`,
                msg,
                'color:gray',
                [
                    count > 1 ? `✕ ${count}` : '',
                    extra,
                    eta ? 'ETA: ' + formatDuration(eta) : '',
                ].filter(x => x).join(' | ')
            );
        }
    }
}
