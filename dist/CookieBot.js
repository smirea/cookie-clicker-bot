function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
const $424feee8fe7c6c95$export$3d8c2f653ac9d0b9 = (selector)=>document.querySelector(selector)
;
const $424feee8fe7c6c95$export$fe324b23443c13e2 = (selector)=>Array.from(document.querySelectorAll(selector))
;
const $424feee8fe7c6c95$export$90b4d2ff6acb88af = window.unsafeWindow || window;
const $424feee8fe7c6c95$export$985739bfa5723e08 = $424feee8fe7c6c95$export$90b4d2ff6acb88af.Game;
const $424feee8fe7c6c95$export$bc733b0c5cbb3e8a = (duration, { short: short = true , pad: pad = false  } = {
})=>{
    duration = Math.floor(duration);
    let hours = String(Math.floor(duration / 3600));
    let minutes = String(Math.floor(duration % 3600 / 60));
    let seconds = String(duration % 60);
    if (pad) [hours, minutes, seconds] = [
        hours,
        minutes,
        seconds
    ].map((num)=>num && ('0' + num).slice(-2)
    );
    const [h, m, s] = short ? [
        'h',
        'm',
        's'
    ] : [
        ' hours',
        ' minutes',
        ' seconds'
    ];
    if (hours !== '0') return `${hours}${h} ${minutes}${m} ${seconds}${s}`;
    if (minutes !== '0') return `${minutes}${m} ${seconds}${s}`;
    return `${seconds}${s}`;
};
const $424feee8fe7c6c95$export$e251d23bea783311 = (number, { cookies: cookies = true , format: format = 'full'  } = {
})=>{
    number = Math.floor(number);
    const labels = [
        [
            'million',
            'M'
        ],
        [
            'billion',
            'B'
        ],
        [
            'trillion',
            'T'
        ],
        [
            'quadrillion',
            'Quad'
        ],
        [
            'quintillion',
            'Quint'
        ],
        [
            'sextillion',
            'Sext😏'
        ],
        [
            'septillion',
            'Sept'
        ],
        [
            'octillion',
            'Oct'
        ],
        [
            'nonillion',
            'Non'
        ],
        [
            'decillion',
            'Dec'
        ], 
    ];
    if (number < 1000) return String(number);
    if (number < 1000000) return `${Math.floor(number / 1000)},${number % 1000}`;
    const power = Math.floor(Math.log10(number));
    const floorPower = Math.floor(power / 3) * 3;
    const label = labels[floorPower / 3 - 2];
    let value = Math.floor(number / Math.pow(10, floorPower));
    value += Math.round(Math.floor(number / Math.pow(10, floorPower - 2)) % 100) / 100;
    value = Math.round(value * 100) / 100;
    const unit = format === 'full' ? ' ' + label[0] : format === 'small' ? ' ' + label[1] : 'e' + floorPower;
    return (cookies ? '🍪' : '') + String(value) + unit;
};


var $4e50deb68dcb59a4$exports = {};
$4e50deb68dcb59a4$exports = JSON.parse("{\"name\":\"@smirea/cookie-clicker-bot\",\"private\":true,\"version\":\"1.8.0\",\"description\":\"\",\"main\":\"dist/CookieBot.js\",\"source\":\"src/index.ts\",\"scripts\":{\"watch\":\"rm -rf dist; parcel watch --no-source-maps\",\"build\":\"rm -rf dist; parcel build --no-source-maps\"},\"repository\":{\"type\":\"git\",\"url\":\"git+https://github.com/smirea/cookie-clicker-bot.git\"},\"keywords\":[],\"author\":\"\",\"license\":\"ISC\",\"bugs\":{\"url\":\"https://github.com/smirea/cookie-clicker-bot/issues\"},\"homepage\":\"https://github.com/smirea/cookie-clicker-bot#readme\",\"devDependencies\":{\"parcel\":\"^2.0.1\"}}");


class $fe57486f6f15e392$export$2e2bcd8739ae039 {
    constructor(){
        this.options = {
            cookieClickTimeout: 1000 / 15.1,
            showLogs: 25,
            buildingWait: 0.35,
            upgradeWait: 0.35,
            wrinklerPopTime: 480000,
            // note: disabled for now, re-enable if page crashes
            autoReloadMinutes: 0,
            bannedUpgrades: {
                'Milk selector': true,
                'Elder Covenant': true
            },
            dragon: {
                /** for each dragon purchase type, at what cookie % should you start waiting */ waitRatios: {
                    cookie: 0.4,
                    building: 0.8,
                    all: 0.9
                },
                /** order in which aura is chosen. If it's not on this list, it won't be selected */ auras: [
                    'Radiant Appetite',
                    'Dragonflight',
                    'Breath of Milk', 
                ]
            }
        };
        this.timers = {
        };
        this.achievementThresholds = {
            Cursor: [
                1,
                2,
                50,
                100,
                200,
                300,
                400,
                500,
                600,
                700,
                800,
                900
            ],
            Default: [
                1,
                50,
                100,
                150,
                200,
                250,
                300,
                350,
                400,
                450,
                500,
                550,
                600
            ]
        };
        this.upgradeFatigue // prevent buying too many updates one after another
         = 1;
        this.cpsCache = {
        };
        this.localStorageLog = `CookieAutomator_logMessages_${$424feee8fe7c6c95$export$985739bfa5723e08.version}_${$424feee8fe7c6c95$export$985739bfa5723e08.beta}`;
        let existingLog = [];
        try {
            existingLog = JSON.parse(localStorage[this.localStorageLog]);
        } catch (ex) {
        }
        this.logMessages = $424feee8fe7c6c95$export$90b4d2ff6acb88af.__automateLog = $424feee8fe7c6c95$export$90b4d2ff6acb88af.__automateLog || existingLog;
        this.options.cookieClickTimeout = Math.max(5, this.options.cookieClickTimeout);
    }
    start() {
        this.stop();
        this.startDate = Date.now();
        this.clickBigCookieTimer();
        this.maybeClickLumpTimer();
        this.shimmerTimer();
        this.buyTimer();
        this.timers.saveLog = setInterval(()=>{
            localStorage[this.localStorageLog] = JSON.stringify(this.logMessages.slice(-100));
        }, 2000);
        this.wrinklerTimer();
        this.timers.dragonAuraTimer = setInterval(()=>this.dragonAuraTimer()
        , 1000);
        this.timers.reloadTimer = setInterval(()=>{
            if (!this.options.autoReloadMinutes) return;
            if (Date.now() - this.startDate / 60000 < this.options.autoReloadMinutes) return;
            if (this.getBuffs().cpsMultiple > 1) return;
            $424feee8fe7c6c95$export$985739bfa5723e08.promptOn = 0;
            $424feee8fe7c6c95$export$90b4d2ff6acb88af.location.reload();
        }, 60000);
    }
    stop() {
        for (const x of Object.values(this.timers)){
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
        return Math.round($424feee8fe7c6c95$export$985739bfa5723e08.cookiesPs + $424feee8fe7c6c95$export$985739bfa5723e08.computedMouseCps * (1000 / this.options.cookieClickTimeout));
    }
    log(msg, { eta: eta , extra: extra , color: color  } = {
    }) {
        const last = this.logMessages[this.logMessages.length - 1];
        if (last && last.msg === msg) {
            ++last.count;
            last.extra = extra;
            last.eta = eta;
        } else {
            if (last) {
                if (last.eta && last.eta < 30000) delete last.eta;
                delete last.extra;
            }
            this.logMessages.push({
                time: Date.now(),
                msg: msg,
                count: 1,
                eta: eta,
                extra: extra,
                color: color
            });
        }
        if (this.logMessages.length > 1000) this.logMessages.splice(0, this.logMessages.length - 1000);
    }
    getBuffs() {
        let cpsMultiple = 1;
        for (const buff of Object.values($424feee8fe7c6c95$export$985739bfa5723e08.buffs)){
            if (!buff.visible || !buff.multCpS) continue;
            cpsMultiple *= buff.multCpS;
        }
        return {
            cpsMultiple: cpsMultiple
        };
    }
    getAvailableDragonAuras() {
        const auras = [];
        for(const i in $424feee8fe7c6c95$export$985739bfa5723e08.dragonAuras){
            const aura = $424feee8fe7c6c95$export$985739bfa5723e08.dragonAuras[i];
            const index = parseInt(i);
            if ($424feee8fe7c6c95$export$985739bfa5723e08.dragonLevel >= index + 4) auras.push({
                ...aura,
                index: index,
                level: index + 4
            });
        }
        auras.sort((a, b)=>a.index - b.index
        );
        return {
            byIndex: auras,
            byName: Object.fromEntries(auras.map((x)=>[
                    x.name,
                    x
                ]
            ))
        };
    }
    buy(obj2, amount1 = 1) {
        if (typeof amount1 === 'number' && amount1 < 1) {
            console.warn('[CookieAutomator.buy()] Cannot get <1 amount: %s of %s', amount1, obj2.name);
            return;
        }
        if (this.upgradeFatigue) {
            if (obj2.type === 'upgrade') {
                const increment = Math.min(2, 0.5 + Math.floor($424feee8fe7c6c95$export$985739bfa5723e08.cookiesPs / 100) / 10);
                this.upgradeFatigue = Math.min(this.upgradeFatigue + increment, 10);
            } else this.upgradeFatigue = Math.max(this.upgradeFatigue - 0.2 * amount1, 1);
        }
        return obj2.buy(amount1);
    }
    maybeClickLumpTimer() {
        if ((Date.now() - $424feee8fe7c6c95$export$985739bfa5723e08.lumpT) / 1000 / 3600 < 23) return;
        $424feee8fe7c6c95$export$985739bfa5723e08.clickLump();
    }
    shimmerTimer() {
        $424feee8fe7c6c95$export$3d8c2f653ac9d0b9('.shimmer')?.click();
        this.timers.shimmerTimer = setTimeout(()=>{
            this.shimmerTimer();
        }, 3000);
    }
    clickBigCookieTimer() {
        $424feee8fe7c6c95$export$3d8c2f653ac9d0b9('#bigCookie')?.click();
        this.timers.clickBigCookieTimer = setTimeout(()=>this.clickBigCookieTimer()
        , this.options.cookieClickTimeout);
    }
    wrinklerTimer() {
        const { cpsMultiple: cpsMultiple  } = this.getBuffs();
        if (cpsMultiple < 1) $424feee8fe7c6c95$export$985739bfa5723e08.CollectWrinklers();
        else if (cpsMultiple === 1) $424feee8fe7c6c95$export$985739bfa5723e08.PopRandomWrinkler();
        this.timers.wrinklerTimer = setTimeout(()=>this.wrinklerTimer()
        , this.options.wrinklerPopTime);
    }
    dragonAuraTimer() {
        if ($424feee8fe7c6c95$export$985739bfa5723e08.hasAura(this.options.dragon.auras[0])) return; // we're done until ascension
        // @TODO: apparently there's a 2nd aura slot to be handled
        const auras = this.getAvailableDragonAuras();
        for (const name of this.options.dragon.auras){
            const aura = auras.byName[name];
            if (!aura) continue;
            if ($424feee8fe7c6c95$export$985739bfa5723e08.hasAura(name)) return;
            const highestBuilding = Array.from($424feee8fe7c6c95$export$985739bfa5723e08.ObjectsById).reverse().find((x)=>x.amount > 0
            );
            if (!highestBuilding) return; // weird but whatever
            if (highestBuilding.amount === 1) {
                highestBuilding.sell();
                this.log(`🤫 Sneakily selling 1 ✕ ${highestBuilding.name} so the dragon doesn't eat it`);
            }
            $424feee8fe7c6c95$export$985739bfa5723e08.ClosePrompt();
            $424feee8fe7c6c95$export$985739bfa5723e08.SetDragonAura(aura.index, 0);
            const btn = $424feee8fe7c6c95$export$3d8c2f653ac9d0b9('#promptOption0');
            if (!btn || btn.innerText.trim().toLowerCase() !== 'confirm') {
                console.warn('[CookieAutomator.dragonAuraTimer()] FML the confirm changed');
                return;
            }
            btn.click();
            this.log('🎇 Changed Dragon Aura: ' + aura.name + '\n(' + $fe57486f6f15e392$var$cleanHTML(aura.desc) + ')', {
                color: 'yellow'
            });
            return;
        }
    }
    getCps(name) {
        this.cpsCache = this.cpsCache || {
        };
        if (this.cpsCache[name]) return this.cpsCache[name];
        const obj = $424feee8fe7c6c95$export$985739bfa5723e08.Objects[name];
        const tooltip = obj.tooltip();
        const match = tooltip.replace(/,/g, '').replace(/\d+(\.\d+)?\s+million/gi, (x)=>String(parseFloat(x) * 1000000)
        ).replace(/\d+(\.\d+)?\s+billion/gi, (x)=>String(parseFloat(x) * 1000000000)
        ).replace(/\d+(\.\d+)?\s+trillion/gi, (x)=>String(parseFloat(x) * 1000000000000)
        ).replace(/\d+(\.\d+)?\s+quadrillion/gi, (x)=>String(parseFloat(x) * 1000000000000000)
        ).replace(/\d+(\.\d+)?\s+quintillion/gi, (x)=>String(parseFloat(x) * 1000000000000000000)
        ).replace(/\d+(\.\d+)?\s+sextillion/gi, (x)=>String(parseFloat(x) * 1000000000000000000000)
        ).replace(/\d+(\.\d+)?\s+septillion/gi, (x)=>String(parseFloat(x) * 1000000000000000000000000)
        ).replace(/\d+(\.\d+)?\s+octillion/gi, (x)=>String(parseFloat(x) * 1000000000000000000000000000)
        ).replace(/\d+(\.\d+)?\s+nonillion/gi, (x)=>String(parseFloat(x) * 1000000000000000000000000000000)
        ).replace(/\d+(\.\d+)?\s+decillion/gi, (x)=>String(parseFloat(x) * 1000000000000000000000000000000000)
        ).match(/produces <b>([^c]+) cookies/) || [];
        let cps = parseFloat(match[1] || '');
        // @TODO: figure out a better way instead of obj.baseCps, it's way too low
        if (Number.isNaN(cps)) return obj.bought ? obj.baseCps : 0;
        if (obj.name === 'Grandma') for (const x1 of $424feee8fe7c6c95$export$985739bfa5723e08.ObjectsById){
            if (x1.name === 'Grandma') continue;
            if (!x1.grandma?.bought) continue;
            const match = x1.grandma.desc.match(/gain <b>\+(\d+).*<\/b> per (\d+)? grandma/i) || [];
            const pct = parseFloat(match[1]);
            const multiplier = parseInt(match[2] || '1', 10);
            if (!pct || !multiplier || Number.isNaN(pct) || Number.isNaN(multiplier)) continue;
            const childCps = x1.cps(x1);
            cps = cps + childCps * (pct / 100) * Math.floor($424feee8fe7c6c95$export$985739bfa5723e08.Objects.Grandma.amount / multiplier);
        }
        this.cpsCache[name] = cps;
        return cps;
    }
    getBuildingStats() {
        const sorted = $424feee8fe7c6c95$export$985739bfa5723e08.ObjectsById.map((obj, index)=>({
                name: obj.name,
                price: obj.price,
                cps: this.getCps(obj.name),
                pricePerCps: Math.round(obj.price / this.getCps(obj.name)),
                index: index,
                obj: obj,
                relativeValue: 0
            })
        ).filter((obj)=>obj.cps
        ).sort((a, b)=>a.pricePerCps - b.pricePerCps
        );
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
        for (const obj1 of sorted)obj1.relativeValue = Math.round(obj1.pricePerCps / min * 10) / 10;
        const active = $424feee8fe7c6c95$export$985739bfa5723e08.ObjectsById.filter((x)=>!x.locked && !x.bought
        );
        const next = sorted[0]?.obj;
        const nextWait = active.find((x)=>$424feee8fe7c6c95$export$985739bfa5723e08.cookies >= x.price * this.options.buildingWait
        );
        const nextNew = active.find((x)=>x.price <= $424feee8fe7c6c95$export$985739bfa5723e08.cookies
        );
        const nextHighValue = sorted.slice(1).find((item, index)=>{
            return sorted[0].price <= $424feee8fe7c6c95$export$985739bfa5723e08.cookies && item.relativeValue - sorted[0].relativeValue >= 10 + 2.5 ** (index + 2);
        }) ? sorted[0].obj : null;
        return {
            next: next,
            nextNew: nextNew,
            nextWait: nextWait,
            nextHighValue: nextHighValue ? {
                obj: nextHighValue,
                amount: $fe57486f6f15e392$var$getAffordableBuildingMultiple(nextHighValue, [
                    50,
                    40,
                    30,
                    20,
                    10,
                    1
                ])
            } : null,
            sorted: sorted
        };
    }
    getUpgradeStats() {
        const getPrice = (upg)=>{
            let result = upg.getPrice();
            if (/cookie production multiplier/i.test(upg.desc)) result *= 1.2;
            else if (/clicking gains/i.test(upg.desc)) result *= 0.8;
            else if (/grandmas|twice/i.test(upg.desc)) result *= 0.6;
            return result;
        };
        const active = Object.values($424feee8fe7c6c95$export$985739bfa5723e08.Upgrades).filter((x)=>!x.bought && x.unlocked && !this.options.bannedUpgrades[x.name]
        ).sort((a, b)=>getPrice(a) - getPrice(b)
        );
        const next = active[0]?.canBuy() ? active[0] : null;
        const waitPrice = active[0]?.getPrice() * this.options.upgradeWait * (this.upgradeFatigue || 1);
        const nextWait = active[0] && $424feee8fe7c6c95$export$985739bfa5723e08.cookies >= 30000 && $424feee8fe7c6c95$export$985739bfa5723e08.cookies >= waitPrice ? active[0] : null;
        const waitPct = nextWait && Math.round($424feee8fe7c6c95$export$985739bfa5723e08.cookies / active[0].getPrice() * 100) + '%' || undefined;
        return {
            next: next,
            nextWait: nextWait,
            waitPct: waitPct
        };
    }
    getSantaStats() {
        const price = Math.pow($424feee8fe7c6c95$export$985739bfa5723e08.santaLevel + 1, $424feee8fe7c6c95$export$985739bfa5723e08.santaLevel + 1);
        if ($424feee8fe7c6c95$export$985739bfa5723e08.santaLevel >= 14 || price > 30 && $424feee8fe7c6c95$export$985739bfa5723e08.cookiesPs < 1000) return {
            wait: null,
            buy: null,
            price: 0
        };
        const buy = $424feee8fe7c6c95$export$985739bfa5723e08.cookies >= price;
        const wait = !buy && $424feee8fe7c6c95$export$985739bfa5723e08.cookies >= price * 0.75;
        return {
            wait: wait,
            buy: buy,
            price: price
        };
    }
    getAchievementThresholdStats() {
        const options = [];
        for (const obj of $424feee8fe7c6c95$export$985739bfa5723e08.ObjectsById){
            if (!obj.bought || obj.amount <= 1) continue;
            const ranges = this.achievementThresholds[obj.name] || this.achievementThresholds.Default;
            if (obj.amount >= ranges[ranges.length - 1]) continue;
            const index = ranges.findIndex((start, i)=>start <= obj.amount && obj.amount < ranges[i + 1]
            );
            const nextAmount = ranges[index + 1];
            const nextPrice = $fe57486f6f15e392$var$getCostOfNBuildings(obj, nextAmount);
            const toBuy = nextAmount - obj.amount;
            options.push({
                obj: obj,
                toBuy: toBuy,
                nextAmount: nextAmount,
                nextPrice: nextPrice,
                available: nextPrice <= $424feee8fe7c6c95$export$985739bfa5723e08.cookies,
                wait: $424feee8fe7c6c95$export$985739bfa5723e08.cookies >= nextPrice * 0.8
            });
        }
        if (!options.length) return null;
        options.sort((a, b)=>a.nextPrice - b.nextPrice
        );
        return options[0];
    }
    getDragonStats() {
        if ($424feee8fe7c6c95$export$985739bfa5723e08.cookiesPs < 100000 || $424feee8fe7c6c95$export$985739bfa5723e08.dragonLevel >= $424feee8fe7c6c95$export$985739bfa5723e08.dragonLevels.length - 1) return {
        };
        if (this.getAvailableDragonAuras().byName[this.options.dragon.auras[0]]) return {
        }; // you've trained your dragon
        const lvl = $424feee8fe7c6c95$export$985739bfa5723e08.dragonLevels[$424feee8fe7c6c95$export$985739bfa5723e08.dragonLevel];
        if (lvl.cost()) return {
            buy: lvl
        };
        const match = lvl.costStr().match(/^(\d+) (.*)$/) || [];
        const amount = parseInt(match[1]);
        const unit = match[2];
        if (!amount || Number.isNaN(amount) || !unit) {
            console.warn('[CookieAutomator:getDragonStats()] Cannot parse: %s', lvl.costStr());
            return {
            };
        }
        const handlers = {
            'million cookies': ()=>({
                    type: 'cookie',
                    amount: amount,
                    cookies: amount
                })
            ,
            'of every building': ()=>({
                    type: 'all',
                    amount: amount,
                    cookies: $424feee8fe7c6c95$export$985739bfa5723e08.ObjectsById.map((obj)=>$fe57486f6f15e392$var$getCostOfNBuildings(obj, amount)
                    ).reduce((s, x)=>s + x
                    , 0)
                })
        };
        for (const obj3 of $424feee8fe7c6c95$export$985739bfa5723e08.ObjectsById)handlers[obj3.plural] = ()=>({
                type: 'building',
                value: obj3.name,
                amount: amount,
                cookies: $fe57486f6f15e392$var$getCostOfNBuildings(obj3, amount)
            })
        ;
        if (!handlers[unit]) {
            console.warn('[CookieAutomator:getDragonStats()] Unknown unit: %s', lvl.costStr());
            return {
            };
        }
        const goal = handlers[unit]();
        if ($424feee8fe7c6c95$export$985739bfa5723e08.cookies >= goal.cookies * this.options.dragon.waitRatios[goal.type]) return {
            wait: {
                lvl: lvl,
                goal: goal
            }
        };
        return {
        };
    }
    buyTimer() {
        console.clear();
        this.cpsCache = {
        };
        let timeout = 1000;
        if (this.upgradeFatigue > 0 && $424feee8fe7c6c95$export$985739bfa5723e08.cookiesPs >= 10000000000000) this.upgradeFatigue = 0;
        const buildings = this.getBuildingStats();
        const upgrades = this.getUpgradeStats();
        const santa = this.getSantaStats();
        const threshold = this.getAchievementThresholdStats();
        const dragon = this.getDragonStats();
        const getEta = (targetCookies)=>{
            if (targetCookies <= $424feee8fe7c6c95$export$985739bfa5723e08.cookies) return undefined;
            return (targetCookies - $424feee8fe7c6c95$export$985739bfa5723e08.cookies) / this.realCps;
        };
        const run = ()=>{
            if (buildings.nextHighValue) {
                const { obj: obj , amount: amount  } = buildings.nextHighValue;
                this.buy(obj, amount);
                return this.log(`💰 So cheap it just can't wait: Bought ${obj.name} ✕ ${amount}`);
            }
            if (dragon.buy) {
                this.buy({
                    name: 'dragon',
                    buy: ()=>$424feee8fe7c6c95$export$985739bfa5723e08.UpgradeDragon()
                });
                this.log(`🔥 Trained your dragon for the low low cost of ${dragon.buy.costStr()} \n(${dragon.buy.action}) `);
                return;
            }
            if (dragon.wait) {
                const { lvl: lvl , goal: goal  } = dragon.wait;
                if ($424feee8fe7c6c95$export$985739bfa5723e08.cookies >= goal.cookies) switch(goal.type){
                    case 'cookie':
                        break;
                    case 'building':
                        {
                            const toBuy = goal.amount - $424feee8fe7c6c95$export$985739bfa5723e08.Objects[goal.value].amount;
                            const obj = $424feee8fe7c6c95$export$985739bfa5723e08.Objects[goal.value];
                            this.log(`🐲 Bought ${toBuy} ✕ ${obj.name} to feed to the dragon`);
                            this.buy(obj, toBuy);
                            break;
                        }
                    case 'all':
                        console.warn('This will totally fuck up everything yo');
                        break;
                }
                else this.log(`🐲 Raising cookies to feed the dragon, need ${$424feee8fe7c6c95$export$e251d23bea783311(goal.cookies)} to get ${lvl.costStr()}`, {
                    eta: getEta(goal.cookies)
                });
                return;
            }
            if (upgrades.next) {
                this.buy(upgrades.next);
                timeout *= 5;
                return this.log(`💹 Bought new upgrade: ${upgrades.next.name}\n(${$fe57486f6f15e392$var$cleanHTML(upgrades.next.desc)})`, {
                    color: 'lightgreen'
                });
            }
            if (upgrades.nextWait) {
                timeout *= 10;
                this.log(`🟡 Waiting to buy new upgrade: ${upgrades.nextWait.name}`, {
                    eta: getEta(upgrades.nextWait.getPrice()),
                    extra: upgrades.waitPct
                });
                return;
            }
            if (threshold?.available) {
                const { obj: obj , toBuy: toBuy , nextAmount: nextAmount  } = threshold;
                const { amount: amount  } = obj;
                this.buy(obj, toBuy);
                this.log(`🚀 To the moon: Bought from ${amount} → ${nextAmount} of ${obj.name}`);
                return;
            }
            if (threshold?.wait) {
                this.log(`🟡 Waiting to buy to threshold for ${threshold.obj.name} - ${$424feee8fe7c6c95$export$e251d23bea783311(threshold.nextPrice)}`, {
                    eta: getEta(threshold.nextPrice)
                });
                timeout *= 10;
                return;
            }
            if (santa.buy) {
                this.buy({
                    buy: ()=>$424feee8fe7c6c95$export$985739bfa5723e08.UpgradeSanta()
                });
                timeout *= 5;
                return this.log('🎅 Ho Ho Ho!');
            }
            if (santa.wait) return this.log(`🎅 Twas the night before X-MAS!`, {
                eta: getEta(santa.price)
            });
            if (buildings.nextNew) {
                this.buy(buildings.nextNew);
                this.log(`🏛 Bought new building type: ${buildings.nextNew.name}`);
                return;
            }
            if (buildings.nextWait) {
                this.log(`🟡 Waiting to buy new building type: ${buildings.nextWait.name}`, {
                    eta: getEta(buildings.nextWait.price)
                });
                timeout *= 10;
                return;
            }
            if (buildings.next) {
                if (buildings.next.price <= $424feee8fe7c6c95$export$985739bfa5723e08.cookies) {
                    this.buy(buildings.next);
                    this.log(`🏛 Bought building: ${buildings.next.name}`);
                    return;
                }
                this.log(`⏲ Waiting to buy building: ${buildings.sorted[0]?.name}`, {
                    eta: getEta(buildings.sorted[0].price)
                });
                timeout *= 5;
                return;
            }
            this.log("You're too poor... but that's a good thing!");
            timeout *= 5;
        };
        run();
        this.printLog({
            buildings: buildings
        });
        this.timers.buyTimer = setTimeout(()=>this.buyTimer()
        , timeout);
    }
    printLog({ buildings: buildings  }) {
        console.log('%c%s v%s', 'color:gray', (/*@__PURE__*/$parcel$interopDefault($4e50deb68dcb59a4$exports)).name, (/*@__PURE__*/$parcel$interopDefault($4e50deb68dcb59a4$exports)).version);
        console.log(`upgradeFatigue: %s | realCps: %s`, this.upgradeFatigue ? Math.round(this.upgradeFatigue * 100) / 100 + 'x' : 'disabled', $424feee8fe7c6c95$export$e251d23bea783311(this.realCps));
        console.log('%cBuy Order:', 'font-weight:bold');
        for (const obj of buildings.sorted)console.log('   - %s: %sx', obj.name, obj.relativeValue);
        // console.log('%cLast %d log messages (window.__automateLog):', 'font-weight:bold', this.options.showLogs);
        for (const { time: time , msg: msg , count: count , eta: eta , extra: extra , color: color = 'white'  } of this.logMessages.slice(-1 * this.options.showLogs))console.log(`%c%s%c %s %c%s`, 'color:gray', new Date(time).toISOString().slice(11, 19), `color:${color}`, msg, 'color:gray', [
            count > 1 ? `✕ ${count}` : '',
            extra,
            eta ? 'ETA: ' + $424feee8fe7c6c95$export$bc733b0c5cbb3e8a(eta) : '', 
        ].filter((x)=>x
        ).join(' | '));
    }
}
const $fe57486f6f15e392$var$getAffordableBuildingMultiple = (obj, choices)=>choices.find((end)=>$fe57486f6f15e392$var$getCostOfNBuildings(obj, obj.amount + end) <= $424feee8fe7c6c95$export$985739bfa5723e08.cookies
    ) || null
;
const $fe57486f6f15e392$var$getCostOfNBuildings = (obj, end)=>obj.amount >= end ? 0 : obj.basePrice * (1.15 ** end - 1.15 ** obj.amount) / 0.15
;
const $fe57486f6f15e392$var$cleanHTML = (html)=>html.replace(/<q>.*<\/q>/g, '').replace(/<[^>]+>/g, '')
;



setTimeout(()=>{
    $424feee8fe7c6c95$export$90b4d2ff6acb88af.myCookieAutomator?.stop();
    $424feee8fe7c6c95$export$90b4d2ff6acb88af.myCookieAutomator = new $fe57486f6f15e392$export$2e2bcd8739ae039;
    $424feee8fe7c6c95$export$90b4d2ff6acb88af.myCookieAutomator.start();
// console.log('>>', myCookieAutomator.getCps('Cursor'));
// console.log('% =', Math.round(myCookieAutomator.getCps('Grandma') / 341437 * 100));
}, 500);
'🍪🚜';


