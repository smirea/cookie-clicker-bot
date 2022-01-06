import type {
    Building,
    BuildingName,
    BuildingStats,
    Buyable,
    DragonLevel,
    DragonLevelGoal,
    Upgrade,
} from './typeDefs';
import { $$, cleanHTML, Game, getAffordableBuildingMultiple, getCostOfNBuildings, global, units } from './utils';
import * as utils from './utils';
import options from './options';

import BuyTimer from './timers/BuyTimer';
import ClickCookieTimer from './timers/ClickCookieTimer';
import DragonAuraTimer from './timers/DragonAuraTimer';
import GardenMinigameTimer from './timers/GardenMinigameTimer';
import GrimoireMinigameTimer from './timers/GrimoireMinigameTimer';
import LogTimer from './timers/LogTimer';
import PageReloadTimer from './timers/PageReloadTimer';
import ShimmerTimer from './timers/ShimmerTimer';
import SugarLumpTimer from './timers/SugarLumpTimer';
import WrinklerTimer from './timers/WrinklerTimer';
import SeasonTimer from './timers/SeasonTimer';
import ClickNewsTimer from './timers/ClickNewsTimer';

const STATES = ['off', 'on', 'click'] as const;

export default class CookieAutomator {
    logMessages: LogMessage[];
    upgradeFatigue = 1; // prevent buying too many updates one after another
    cpsCache: { [key in BuildingName]?: number } = {};
    startDate!: number;
    lastState: { buildings: BuildingStats } = {} as any;
    domNode: HTMLDivElement;
    timers = {
        BuyTimer: new BuyTimer(this),
        ClickCookieTimer: new ClickCookieTimer(this),
        ClickNewsTimer: new ClickNewsTimer(this),
        DragonAuraTimer: new DragonAuraTimer(this),
        GardenMinigameTimer: new GardenMinigameTimer(this),
        GrimoireMinigameTimer: new GrimoireMinigameTimer(this),
        LogTimer: new LogTimer(this),
        PageReloadTimer: new PageReloadTimer(this),
        SeasonTimer: new SeasonTimer(this),
        ShimmerTimer: new ShimmerTimer(this),
        SugarLumpTimer: new SugarLumpTimer(this),
        WrinklerTimer: new WrinklerTimer(this),
    };
    state: typeof STATES[number] = 'off';
    timeout?: NodeJS.Timeout;
    tickCounter = 0;
    /** @deprecated keep for debug only in the console */
    utils = utils;

    constructor() {
        let existingLog = [];
        try {
            existingLog = JSON.parse(localStorage[options.localStorage.log]);
        } catch (ex) {}
        this.logMessages = global.__automateLog = global.__automateLog || existingLog;

        $$('.CookieAutomator').forEach(el => el.remove());
        this.domNode = document.createElement('div');
        document.body.appendChild(this.domNode);
        this.domNode.classList.add('CookieAutomator');
        this.domNode.setAttribute('style', 'position:fixed;z-index:999999999999;top:35px;left:5px;cursor:pointer;display:flex;align-items:center;color:white;cursor:pointer;background:rgba(0,0,0,0.95);padding:5px;');
        this.domNode.innerHTML = `
            <span>Automator: </span>
            <span style='margin-left:5px'></span>
            <span class='icon' style='width:10px;height:10px;border-radius:50%;margin-left:5px;'></span>
        `;
        this.domNode.addEventListener('click', () => {
            this.switchState();
        });
        this.updateDom();
    }

    start() { this.switchState('on'); }
    stop() { this.switchState('off'); }
    reset() {
        this.stop();
        for (const key in options.localStorage) delete localStorage[key];
        location.reload();
    }

    switchState(next?: typeof STATES[number]) {
        if (!next) {
            const index = STATES.findIndex(x => x === this.state);
            next = STATES[(index + 1) % STATES.length];
        }

        if (next === this.state) return;

        this.state = next;
        this.applyState(this.state);
        this.updateDom();
    }

    applyState(state: typeof STATES[number]) {
        this.startDate = this.startDate || Date.now();
        this.tickCounter = this.tickCounter || 0;

        // console.clear();
        // console.table(
        //     Object.values(this.timers).map(timer => ({
        //         name: timer.constructor.name,
        //         ticks: timer.defaultTimeout,
        //         timeSeconds: timer.defaultTimeoutMs / 1000,
        //     }))
        // );

        switch (state) {
            case 'off':
                this.startDate = 0;
                this.tickCounter = 0;
                clearTimeout(this.timeout!);
                for (const timer of Object.values(this.timers)) timer.stop();
                break;
            case 'click':
                this.applyState('off');
                for (const timer of Object.values(this.timers)) {
                    if (timer.type === 'clicker') timer.start();
                }
                this.tick();
                break;
            case 'on':
                this.applyState('off');
                for (const timer of Object.values(this.timers)) timer.start();
                this.tick();
                break;
        }
    }

    tick() {
        clearTimeout(this.timeout!);

        for (const timer of Object.values(this.timers)) {
            if (timer.isStopped) continue;
            if (this.tickCounter % timer.timeout !== 0) continue;
            if (timer.startDelay() && this.tickCounter === 0) continue;
            timer.run();
        }

        ++this.tickCounter;
        setTimeout(() => this.tick(), options.tickMs);
    }

    updateDom() {
        const [, text, icon] = this.domNode.children as unknown as HTMLDivElement[];
        text.innerHTML = this.state;
        switch(this.state) {
            case 'off': icon.style.background = 'red'; break;
            case 'click': icon.style.background = 'orange'; break;
            case 'on': icon.style.background = 'lightgreen'; break;
        }
    }

    get realCps() {
        return Math.round(
            Game.cookiesPs +
            Game.computedMouseCps * this.timers.ClickCookieTimer.defaultTimeoutMs
        );
    }

    log(msg: string, { eta, extra, color }: Pick<LogMessage, 'color' | 'extra' | 'eta'> = {}) {
        msg = cleanHTML(msg);
        let last = this.logMessages[this.logMessages.length - 1];
        if (last && last.msg === msg) {
            ++last.count;
            last.extra = extra;
            last.eta = eta;
        } else {
            if (last) {
                if (last.eta && last.eta < 30e3) delete last.eta;
                delete last.extra;
            }
            this.logMessages.push({
                id: (last?.id || 0) + 1,
                time: Date.now(), msg,
                count: 1,
                eta,
                extra,
                color,
            });
        }

        if (this.logMessages.length > 1000) {
            this.logMessages.splice(0, this.logMessages.length - 1000);
        }
    }

    getBuffs() {
        let cpsMultiple = 1;
        let negativeBuffs = 0;
        let positiveBuffs = 0;
        for (const buff of Object.values(Game.buffs)) {
            if (!buff.visible || !buff.multCpS) continue;
            cpsMultiple *= buff.multCpS;
            if (buff.multCpS < 1) ++negativeBuffs; else ++positiveBuffs;
        }
        return { cpsMultiple, negativeBuffs, positiveBuffs };
    }

    getAvailableUpgrades() {
        return Game.UpgradesInStore
            .filter(x =>
                !options.bannedUpgrades[x.name] &&
                !x.bought &&
                x.unlocked &&
                x.pool !== 'toggle' &&
                x.pool !== 'debug'
            );
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
        const match = units.strReplace(tooltip).match(/produces <b>([^\s]+) cookies/) || [];
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
            .filter(x => !x.locked)
            .map((obj, index) => ({
                name: obj.name,
                price: obj.price,
                cps: this.getCps(obj.name),
                pricePerCps: Math.max(0.01, Math.round(obj.price / this.getCps(obj.name))),
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

        const active = Game.ObjectsById.filter(x => !x.bought);
        const next = sorted[0]?.obj;
        const nextWait = active.find(x => Game.cookies >= x.price * options.buildingWait);
        const nextNew = active.find(x => x.price <= Game.cookies);
        let nextHighValue: Building | undefined = sorted.find(item =>
            !item.obj.locked && item.obj.amount == 0 && item.obj.price <= Game.cookies
        )?.obj;
        nextHighValue ||= sorted.slice(1, 7).find((item, index) => {
            return sorted[0].price <= Game.cookies &&
                item.relativeValue - sorted[0].relativeValue >= 10 + (2.5 ** (index + 2));
        }) && sorted[0].obj;

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
        if (Game.cookiesPs < 1) return {};

        const getPrice = (upg: Upgrade) => { // takes into account willingness factor, used for sorting
            let result = upg.getPrice();
            if (/cookie production multiplier/i.test(upg.desc)) result *= 1.2;
            else if (/clicking gains/i.test(upg.desc)) result *= 0.8;
            else if (/grandmas|twice/i.test(upg.desc)) result *= 0.6;
            else if (/mouse and cursor/i.test(upg.desc)) result *= 0.5;
            return result;
        }
        const active = this.getAvailableUpgrades().sort((a, b) => getPrice(a) - getPrice(b));
        const next = active[0]?.canBuy()
            ? active[0]
            // just buy really cheap upgrades
            : active.find(x => x.getPrice() <= Game.cookies * 0.01);
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
        if (Game.cookiesPs < 1e3) return {};

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
        if (Game.cookiesPs < 1e3) return null;

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

        // buy cheap upgrades first
        if (Game.UpgradesInStore.find(x => !x.pool && x.getPrice() <= 10e6)) return {};

        // higher value = lower priority
        // once your favorite aura has been researched, deprioritize dragon upgrades till you have the 2nd one
        const priorityMultiple = this.getAvailableDragonAuras().byName[options.dragon.auras[0]]
            ? 1.25
            : 1;

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
                cookies: Game.ObjectsById.find(x => x.locked)
                    ? Infinity // unlock all buildings first
                    : Game.ObjectsById
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

        if (Game.cookies >= goal.cookies * priorityMultiple * options.dragon.waitRatios[goal.type]) {
            return { wait: { lvl, goal } };
        }

        return {};
    }
}
