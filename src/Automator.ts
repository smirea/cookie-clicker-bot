import type { Building, BuildingMeta, BuildingName, Buyable, Upgrade } from './typeDefs';
import { $$, cleanHTML, Game, global, units } from './utils';
import * as utils from './utils';
import options from './options';

import BuyTimer from './timers/BuyTimer';
import ClickCookieTimer from './timers/ClickCookieTimer';
import ClickNewsTimer from './timers/ClickNewsTimer';
import DragonAuraTimer from './timers/DragonAuraTimer';
import GardenMinigameTimer from './timers/GardenMinigameTimer';
import GrimoireMinigameTimer from './timers/GrimoireMinigameTimer';
import LogTimer from './timers/LogTimer';
import PageReloadTimer from './timers/PageReloadTimer';
import PantheonMinigameTimer from './timers/PantheonMinigameTimer';
import SeasonTimer from './timers/SeasonTimer';
import ShimmerTimer from './timers/ShimmerTimer';
import SugarLumpTimer from './timers/SugarLumpTimer';
import WrinklerTimer from './timers/WrinklerTimer';

const STATES = ['off', 'on', 'click'] as const;

export default class Automator {
    logMessages: LogMessage[];
    upgradeFatigue = 1; // prevent buying too many updates one after another
    cpsCache: { [key in BuildingName]?: number } = {};
    startDate!: number;
    lastState: { buildings: BuildingMeta[] } = {} as any;
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
        PantheonMinigameTimer: new PantheonMinigameTimer(this),
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

        if (this.isAscended()) {
            this.ascendSetup();
        } else {
            for (const timer of Object.values(this.timers)) {
                if (this.tickCounter % timer.timeout !== 0) continue;
                if (timer.startDelay() && this.tickCounter === 0) continue;
                timer.sideEffects(); // always runs even when the timer is stopped
                if (timer.isStopped) continue;
                timer.run();
            }
            ++this.tickCounter;
        }

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
        const clickTimer = this.timers.ClickCookieTimer;
        if (!clickTimer || clickTimer.isStopped) return Game.cookiesPs;
        return Math.round(
            Game.cookiesPs +
            // 0.95 since timers are not reaaaly exact
            0.95 * Game.computedMouseCps * 1000 / clickTimer.defaultTimeoutMs
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

        // console.log(msg);
    }

    getBuffs() {
        let cpsMultiple = 1;
        let multClick = 1;
        let negativeBuffs = 0;
        let positiveBuffs = 0;
        for (const buff of Object.values(Game.buffs)) {
            if (!buff.visible) continue;
            if (buff.name === 'Devastation') continue; // this happens all the time so just ignore it
            if (buff.multCpS) {
                cpsMultiple *= buff.multCpS;
                if (buff.multCpS < 1) ++negativeBuffs; else ++positiveBuffs;
            }
            if (buff.multClick) {
                multClick *= buff.multClick;
            }
        }
        return {
            cpsMultiple,
            negativeBuffs,
            positiveBuffs,
            multClick,
        };
    }

    getAvailableUpgrades() {
        return Game.UpgradesInStore.filter(x =>
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
            console.warn('[Automator.buy()] Cannot get <1 amount: %s of %s', amount, (obj as any).name)
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
        const building = Game.Objects[name];
        if (!building.amount) return building.baseCps * Game.globalCpsMult;

        const ownCps = building.storedTotalCps / building.amount * Game.globalCpsMult;

        // --- Mostly copy-pasted directly from the game code ---

        let synergyBoost = 0;

        if (building.name == 'Grandma') {
            for (let i in Game.GrandmaSynergies) {
                if (Game.Has(Game.GrandmaSynergies[i])) {
                    const other = Game.Upgrades[Game.GrandmaSynergies[i]].buildingTie!;
                    const mult = building.amount * 0.01 * (1 / (other.id - 1));
                    const boost = (other.storedTotalCps * Game.globalCpsMult) - (other.storedTotalCps * Game.globalCpsMult) / (1 + mult);
                    synergyBoost += boost;
                }
            }
        } else if (building.name == 'Portal' && Game.Has('Elder Pact')) {
            const other = Game.Objects['Grandma'];
            const boost = (building.amount * 0.05 * other.amount) * Game.globalCpsMult;
            synergyBoost += boost;
        }

        for (let i in building.synergies) {
            const it = building.synergies[i];
            if (Game.Has(it.name)) {
                let weight = 0.05;
                let other = it.buildingTie1!;
                if (building == it.buildingTie1) { weight = 0.001; other = it.buildingTie2!; }
                const boost = (other.storedTotalCps * Game.globalCpsMult) - (other.storedTotalCps * Game.globalCpsMult) / (1 + building.amount * weight);
                synergyBoost += boost;
            }
        }

        // --- end mostly copy-pasted code ---

        return ownCps + synergyBoost;
    }

    /** returns if in the middle of ascending animation OR in the ascend screen */
    isAscended() { return !!(Game.OnAscend || Game.AscendTimer); }

    ascendSetup() {
        if (!Game.OnAscend) return;

        const upgradeSlots = (
            Game.Upgrades['Permanent upgrade slot V']?.bought ? 5 :
            Game.Upgrades['Permanent upgrade slot IV']?.bought ? 4 :
            Game.Upgrades['Permanent upgrade slot III']?.bought ? 3 :
            Game.Upgrades['Permanent upgrade slot II']?.bought ? 2 :
            Game.Upgrades['Permanent upgrade slot I']?.bought ? 1 :
            0
        );

        const upgrades = Object.values(Game.Upgrades)
            .filter(y => y.bought && y.pool === '')
            .sort((a, b) => b.getPrice() - a.getPrice());
        const buckets = {
            kittens: [] as Upgrade[],
            other: [] as Upgrade[],
        } as const;
        for (const upgrade of upgrades) {
            if (upgrade.name.startsWith('Kitten')) buckets.kittens.push(upgrade);
            else buckets.other.push(upgrade);
        }
        const old = Game.permanentUpgrades;
        // inspiration: https://pastebin.com/ppKuiupm
        const next = [
            ...buckets.kittens.slice(0, 1),
            ...buckets.other,
        ].slice(0, upgradeSlots);
        Game.permanentUpgrades = next.map(x => x.id);
        Game.BuildAscendTree();

        if (old.join(',') !== Game.permanentUpgrades.join(',')) {
            this.log(
                '🏆 Set permanent ascention upgrades:\n' +
                next.map((x, i) => `${i + 1}) ${x.name}: ${x.desc}`).join('\n')
            );
        }
    }
}
