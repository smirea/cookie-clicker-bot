import type {
    Building,
    BuildingName,
    Buyable,
    DragonLevel,
    DragonLevelGoal,
    Upgrade,
} from './typeDefs';
import { $, formatAmount, formatDuration, Game, global } from './utils';
import packageJson from '../package.json';

export default class CookieAutomator {
    options = {
        cookieClickTimeout: 1000 / 15.1, // sneaky
        showLogs: 25,
        buildingWait: 0.35, // what % [0-1] of the building price to start waiting to buy
        upgradeWait: 0.35, // what % [0-1] of the upgrade price to start waiting to buy
        wrinklerPopTime: 8 * 60e3, // pop a wrinkler every X ms
        // note: disabled for now, re-enable if page crashes
        autoReloadMinutes: 0, // refresh the page every X minutes if there isn't an active buff
        bannedUpgrades: {
            'Milk selector': true, // why would you ever buy this :/
            'Elder Covenant': true, // don't stop, can't stop, won't stop the grandmapocalypse
        } as Record<string, boolean>,
        dragon: {
            /** for each dragon purchase type, at what cookie % should you start waiting */
            waitRatios: {
                cookie: 0.4,
                building: 0.8,
                all: 0.9,
            },
            /** order in which aura is chosen. If it's not on this list, it won't be selected */
            auras: [
                'Radiant Appetite',
                'Dragonflight',
                'Breath of Milk',
            ],
        },
    };

    logMessages: LogMessage[];
    private timers: Record<string, NodeJS.Timeout> = {};
    achievementThresholds: Record<string, number[]> = {
        Cursor: [1, 2, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        Default: [1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600],
    };
    upgradeFatigue = 1; // prevent buying too many updates one after another
    private cpsCache: { [key in BuildingName]?: number } = {};
    private startDate!: number;

    localStorageLog = `CookieAutomator_logMessages_${Game.version}_${Game.beta}`;

    constructor() {
        let existingLog = [];
        try {
            existingLog = JSON.parse(localStorage[this.localStorageLog]);
        } catch (ex) {}
        this.logMessages = global.__automateLog = global.__automateLog || existingLog;
        this.options.cookieClickTimeout = Math.max(5, this.options.cookieClickTimeout);
    }

    start() {
        this.stop();
        this.startDate = Date.now();
        this.clickBigCookieTimer();
        this.maybeClickLumpTimer();
        this.shimmerTimer();
        this.buyTimer();
        this.timers.saveLog = setInterval(() => {
            localStorage[this.localStorageLog] = JSON.stringify(this.logMessages.slice(-100));
        }, 2e3);
        this.wrinklerTimer();
        this.timers.dragonAuraTimer = setInterval(() => this.dragonAuraTimer(), 1e3);
        this.timers.reloadTimer = setInterval(() => {
            if (!this.options.autoReloadMinutes) return;
            if (Date.now() - this.startDate / 60e3 < this.options.autoReloadMinutes) return;
            if (this.getBuffs().cpsMultiple > 1) return;
            Game.promptOn = 0;
            global.location.reload();
        }, 60e3);
    }

    stop() {
        for (const x of Object.values(this.timers)) {
            clearTimeout(x);
            clearInterval(x);
        }
    }

    reset() {
        this.stop();
        delete localStorage[this.localStorageLog];
        console.warn('I suggest reloading the webpage');
    }

    get realCps() {
        return Math.round(Game.cookiesPs + Game.computedMouseCps * (1000 / this.options.cookieClickTimeout));
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

    wrinklerTimer() {
        const { cpsMultiple } = this.getBuffs();

        if (cpsMultiple < 1) Game.CollectWrinklers();
        else if (cpsMultiple === 1) Game.PopRandomWrinkler();

        this.timers.wrinklerTimer = setTimeout(
            () => this.wrinklerTimer(),
            this.options.wrinklerPopTime
        );
    }

    dragonAuraTimer() {
        if (Game.hasAura(this.options.dragon.auras[0])) return; // we're done until ascension
        // @TODO: apparently there's a 2nd aura slot to be handled

        const auras = this.getAvailableDragonAuras();

        for (const name of this.options.dragon.auras) {
            const aura = auras.byName[name];

            if (!aura) continue;
            if (Game.hasAura(name)) return;

            const highestBuilding = Array.from(Game.ObjectsById).reverse().find(x => x.amount > 0);
            if (!highestBuilding) return; // weird but whatever

            if (highestBuilding.amount === 1) {
                highestBuilding.sell();
                this.log(`🤫 Sneakily selling 1 ✕ ${highestBuilding.name} so the dragon doesn't eat it`);
            }

            Game.ClosePrompt();
            Game.SetDragonAura(aura.index, 0);

            const btn = $('#promptOption0');
            if (!btn || btn.innerText.trim().toLowerCase() !== 'confirm') {
                console.warn('[CookieAutomator.dragonAuraTimer()] FML the confirm changed');
                return;
            }
            btn.click();
            this.log('🎇 Changed Dragon Aura: ' + aura.name + '\n(' + cleanHTML(aura.desc) + ')', { color: 'yellow' });
            return;
        }
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
            .filter(x => !x.bought && x.unlocked && !this.options.bannedUpgrades[x.name])
            .sort((a, b) => getPrice(a) - getPrice(b));
        const next = active[0]?.canBuy() ? active[0] : null;
        const waitPrice = active[0]?.getPrice() * this.options.upgradeWait * (this.upgradeFatigue || 1);
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
        const options = [];

        for (const obj of Game.ObjectsById) {
            if (!obj.bought || obj.amount <= 1) continue;
            const ranges = this.achievementThresholds[obj.name] || this.achievementThresholds.Default;
            if (obj.amount >= ranges[ranges.length - 1]) continue;
            const index = ranges.findIndex((start, i) => start <= obj.amount && obj.amount < ranges[i + 1]);
            const nextAmount = ranges[index + 1];
            const nextPrice = getCostOfNBuildings(obj, nextAmount);
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

        if (!options.length) return null;

        options.sort((a, b) => a.nextPrice - b.nextPrice);
        return options[0];
    }

    getDragonStats(): { buy?: DragonLevel; wait?: { lvl: DragonLevel; goal: DragonLevelGoal } } {
        if (Game.cookiesPs < 1e5 || Game.dragonLevel >= Game.dragonLevels.length - 1) {
            return {};
        }

        if (this.getAvailableDragonAuras().byName[this.options.dragon.auras[0]]) {
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

        if (Game.cookies >= goal.cookies * this.options.dragon.waitRatios[goal.type]) {
            return { wait: { lvl, goal } };
        }

        return {};
    }

    buyTimer() {
        console.clear();
        this.cpsCache = {};
        let timeout = 1000;

        if (this.upgradeFatigue > 0 && Game.cookiesPs >= 1e13) {
            this.upgradeFatigue = 0;
        }

        const buildings = this.getBuildingStats();
        const upgrades = this.getUpgradeStats();
        const santa = this.getSantaStats();
        const threshold = this.getAchievementThresholdStats();
        const dragon = this.getDragonStats();
        const getEta = (targetCookies: number) => {
            if (targetCookies <= Game.cookies) return undefined;
            return (targetCookies - Game.cookies) / this.realCps;
        }

        const run = () => {
            if (buildings.nextHighValue) {
                const { obj, amount } = buildings.nextHighValue;
                this.buy(obj, amount);
                return this.log(`💰 So cheap it just can't wait: Bought ${obj.name} ✕ ${amount}`);
            }

            if (dragon.buy) {
                this.buy({ name: 'dragon', buy: () => Game.UpgradeDragon() });
                this.log(`🔥 Trained your dragon for the low low cost of ${dragon.buy.costStr()} \n(${dragon.buy.action}) `);
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
                            this.log(`🐲 Bought ${toBuy} ✕ ${obj.name} to feed to the dragon`);
                            this.buy(obj, toBuy);
                            break;
                        }
                        case 'all':
                            console.warn('This will totally fuck up everything yo');
                            break;
                    }
                } else {
                    this.log(`🐲 Raising cookies to feed the dragon, need ${formatAmount(goal.cookies)} to get ${lvl.costStr()}`, { eta: getEta(goal.cookies) });
                }
                return;
            }

            if (upgrades.next) {
                this.buy(upgrades.next);
                timeout *= 5;
                return this.log(
                    `💹 Bought new upgrade: ${upgrades.next.name}\n(${cleanHTML(upgrades.next.desc)})`,
                    { color: 'lightgreen' }
                );
            }

            if (upgrades.nextWait) {
                timeout *= 10;
                this.log(
                    `🟡 Waiting to buy new upgrade: ${upgrades.nextWait.name}`,
                    { eta: getEta(upgrades.nextWait.getPrice()), extra: upgrades.waitPct }
                );
                return;
            }

            if (threshold?.available) {
                const { obj, toBuy, nextAmount } = threshold;
                const { amount } = obj;
                this.buy(obj, toBuy);
                this.log(`🚀 To the moon: Bought from ${amount} → ${nextAmount} of ${obj.name}`);
                return;
            }

            if (threshold?.wait) {
                this.log(
                    `🟡 Waiting to buy to threshold for ${threshold.obj.name} - ${formatAmount(threshold.nextPrice)}`,
                    { eta: getEta(threshold.nextPrice) }
                );
                timeout *= 10;
                return;
            }

            if (santa.buy) {
                this.buy({ buy: () => Game.UpgradeSanta() });
                timeout *= 5;
                return this.log('🎅 Ho Ho Ho!');
            }

            if (santa.wait) {
                return this.log(`🎅 Twas the night before X-MAS!`, { eta: getEta(santa.price) });
            }

            if (buildings.nextNew) {
                this.buy(buildings.nextNew);
                this.log(`🏛 Bought new building type: ${buildings.nextNew.name}`);
                return;
            }

            if (buildings.nextWait) {
                this.log(
                    `🟡 Waiting to buy new building type: ${buildings.nextWait.name}`,
                    { eta: getEta(buildings.nextWait.price) }
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
                    { eta: getEta(buildings.sorted[0].price) }
                );
                timeout *= 5;
                return
            }

            this.log("You're too poor... but that's a good thing!");
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
        console.log(
            `upgradeFatigue: %s | realCps: %s`,
            this.upgradeFatigue ? Math.round(this.upgradeFatigue * 100) / 100 + 'x' : 'disabled',
            formatAmount(this.realCps)
        );
        console.log('%cBuy Order:', 'font-weight:bold');
        for (const obj of buildings.sorted) {
            console.log('   - %s: %sx', obj.name, obj.relativeValue);
        }
        // console.log('%cLast %d log messages (window.__automateLog):', 'font-weight:bold', this.options.showLogs);
        for (const { time, msg, count, eta, extra, color = 'white' } of this.logMessages.slice(-1 * this.options.showLogs)) {
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

const getAffordableBuildingMultiple = (obj: Building, choices: number[]) =>
    choices.find(end => getCostOfNBuildings(obj, obj.amount + end) <= Game.cookies) || null;

const getCostOfNBuildings = (obj: Building, end: number) =>
    obj.amount >= end
        ? 0
        : obj.basePrice * (1.15 ** end - 1.15 ** obj.amount) / 0.15;

const cleanHTML = (html: string) => html.replace(/<q>.*<\/q>/g, '').replace(/<[^>]+>/g, '');
