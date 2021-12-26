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
            'Million',
            'M'
        ],
        [
            'Billion',
            'B'
        ],
        [
            'Trillion',
            'T'
        ],
        [
            'Quadrillion',
            'Quad'
        ],
        [
            'Quintillion',
            'Quint'
        ],
        [
            'Sextillion',
            'Sext😏'
        ],
        [
            'Septillion',
            'Sept'
        ],
        [
            'Octillion',
            'Oct'
        ],
        [
            'Nonillion',
            'Non'
        ],
        [
            'Decillion',
            'Dec'
        ], 
    ];
    if (number < 1000) return String(number);
    if (number < 1000000) return `${Math.floor(number / 1000)},${number % 1000}`;
    const power = Math.floor(Math.log10(number));
    const floorPower = Math.floor(power / 3) * 3;
    const label = labels[floorPower / 3 - 2];
    let value = Math.floor(number / Math.pow(10, floorPower));
    value += Math.floor(number / Math.pow(10, floorPower - 2)) % 100 / 100;
    const unit = format === 'full' ? ' ' + label[0] : format === 'small' ? ' ' + label[1] : 'e' + floorPower;
    return (cookies ? '🍪' : '') + String(value) + unit;
};


var $4e50deb68dcb59a4$exports = {};
$4e50deb68dcb59a4$exports = JSON.parse("{\"name\":\"@smirea/cookie-clicker-bot\",\"private\":true,\"version\":\"1.1.0\",\"description\":\"\",\"main\":\"dist/CookieBot.js\",\"source\":\"src/index.ts\",\"scripts\":{\"watch\":\"rm -rf dist; parcel watch --no-source-maps\",\"build\":\"rm -rf dist; parcel build --no-source-maps\"},\"repository\":{\"type\":\"git\",\"url\":\"git+https://github.com/smirea/cookie-clicker-bot.git\"},\"keywords\":[],\"author\":\"\",\"license\":\"ISC\",\"bugs\":{\"url\":\"https://github.com/smirea/cookie-clicker-bot/issues\"},\"homepage\":\"https://github.com/smirea/cookie-clicker-bot#readme\",\"devDependencies\":{\"parcel\":\"^2.0.1\"}}");


class $fe57486f6f15e392$export$2e2bcd8739ae039 {
    constructor(){
        this.options = {
            cookieClickTimeout: 1000 / 15.1,
            showLogs: 20,
            buildingWait: 0.35,
            upgradeWait: 0.2
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
        this._cpsCache = {
        };
        let existingLog = [];
        try {
            existingLog = JSON.parse(localStorage.CookieAutomator_logMessages);
        } catch (ex) {
        }
        this.logMessages = $424feee8fe7c6c95$export$90b4d2ff6acb88af.__automateLog = $424feee8fe7c6c95$export$90b4d2ff6acb88af.__automateLog || existingLog;
        this.options.cookieClickTimeout = Math.max(5, this.options.cookieClickTimeout);
    }
    start() {
        this.clickBigCookieTimer();
        this.maybeClickLumpTimer();
        this.shimmerTimer();
        this.buyTimer();
        this.timers.saveLog = setInterval(()=>{
            localStorage.CookieAutomator_logMessages = JSON.stringify(this.logMessages.slice(-100));
        }, 2000);
    }
    stop() {
        for (const x of Object.values(this.timers)){
            clearTimeout(x);
            clearInterval(x);
        }
    }
    get realCps() {
        return $424feee8fe7c6c95$export$985739bfa5723e08.cookiesPs + $424feee8fe7c6c95$export$985739bfa5723e08.computedMouseCps * (1000 / this.options.cookieClickTimeout);
    }
    log(msg, extra) {
        const last = this.logMessages[this.logMessages.length - 1];
        if (last && last.msg === msg) {
            ++last.count;
            last.extra = extra;
        } else this.logMessages.push({
            time: Date.now(),
            msg: msg,
            count: 1,
            extra: extra
        });
        if (this.logMessages.length > 1000) this.logMessages.splice(0, this.logMessages.length - 1000);
    }
    buy(obj2, amount1 = 1) {
        if (obj2.type === 'upgrade') this.upgradeFatigue = Math.min(this.upgradeFatigue + 2, 10);
        else this.upgradeFatigue = Math.max(this.upgradeFatigue - 0.2 * amount1, 1);
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
    getCps(name) {
        this._cpsCache = this._cpsCache || {
        };
        if (this._cpsCache[name]) return this._cpsCache[name];
        const obj = $424feee8fe7c6c95$export$985739bfa5723e08.Objects[name];
        const tooltip = obj.tooltip();
        const match = tooltip.replace(/,/g, '').replace(/\d+(\.\d+)?\s+million/gi, (x)=>String(parseFloat(x) * 1000000)
        ).replace(/\d+(\.\d+)?\s+billion/gi, (x)=>String(parseFloat(x) * 1000000000)
        ).replace(/\d+(\.\d+)?\s+trillion/gi, (x)=>String(parseFloat(x) * 1000000000000)
        ).replace(/\d+(\.\d+)?\s+quadrillion/gi, (x)=>String(parseFloat(x) * 1000000000000000)
        ).replace(/\d+(\.\d+)?\s+quintillion/gi, (x)=>String(parseFloat(x) * 1000000000000000000)
        ).match(/produces <b>([^c]+) cookies/) || [];
        let cps = parseFloat(match[1] || '');
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
        this._cpsCache[name] = cps;
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
            nextHighValue: nextHighValue,
            sorted: sorted
        };
    }
    getUpgradeStats() {
        const getPrice = (upg)=>{
            let result = upg.getPrice();
            if (/cookie production multiplier/i.test(upg.desc)) result *= 1.5;
            else if (/clicking gains/i.test(upg.desc)) result *= 0.8;
            else if (/grandmas|twice/i.test(upg.desc)) result *= 0.6;
            return result;
        };
        const active = Object.values($424feee8fe7c6c95$export$985739bfa5723e08.Upgrades).filter((x)=>!x.bought && x.unlocked
        ).sort((a, b)=>getPrice(a) - getPrice(b)
        );
        const next = active.find((x)=>x.canBuy()
        );
        const nextWait = $424feee8fe7c6c95$export$985739bfa5723e08.cookies >= 30000 && active.find((x)=>!x.canBuy() && $424feee8fe7c6c95$export$985739bfa5723e08.cookies >= x.getPrice() * this.options.upgradeWait * this.upgradeFatigue
        );
        return {
            next: next,
            nextWait: nextWait
        };
    }
    getSantaStats() {
        const price = Math.pow($424feee8fe7c6c95$export$985739bfa5723e08.santaLevel + 1, $424feee8fe7c6c95$export$985739bfa5723e08.santaLevel + 1);
        const buy = $424feee8fe7c6c95$export$985739bfa5723e08.cookies >= price && $424feee8fe7c6c95$export$985739bfa5723e08.santaLevel < 14;
        const wait = !buy && $424feee8fe7c6c95$export$985739bfa5723e08.cookies >= price * 0.75 && $424feee8fe7c6c95$export$985739bfa5723e08.santaLevel < 14;
        return {
            wait: wait,
            buy: buy,
            price: price
        };
    }
    getAchievementThresholdStats() {
        const options = [];
        const getNCost = (obj, end)=>obj.basePrice * (1.15 ** end - 1.15 ** obj.amount) / 0.15
        ;
        for (const obj3 of $424feee8fe7c6c95$export$985739bfa5723e08.ObjectsById){
            if (!obj3.bought || obj3.amount <= 1) continue;
            const ranges = this.achievementThresholds[obj3.name] || this.achievementThresholds.Default;
            if (obj3.amount >= ranges[ranges.length - 1]) continue;
            const index = ranges.findIndex((start, i)=>start <= obj3.amount && obj3.amount < ranges[i + 1]
            );
            const nextAmount = ranges[index + 1];
            const nextPrice = getNCost(obj3, nextAmount);
            const toBuy = nextAmount - obj3.amount;
            options.push({
                obj: obj3,
                toBuy: toBuy,
                nextAmount: nextAmount,
                nextPrice: nextPrice,
                available: nextPrice <= $424feee8fe7c6c95$export$985739bfa5723e08.cookies,
                wait: $424feee8fe7c6c95$export$985739bfa5723e08.cookies >= nextPrice * 0.8
            });
        }
        options.sort((a, b)=>a.nextPrice - b.nextPrice
        );
        return options[0];
    }
    buyTimer() {
        this._cpsCache = {
        };
        let timeout = 1000;
        const buildings = this.getBuildingStats();
        const upgrades = this.getUpgradeStats();
        const santa = this.getSantaStats();
        const threshold = this.getAchievementThresholdStats();
        const waitTime = (targetCookies)=>{
            if (targetCookies <= $424feee8fe7c6c95$export$985739bfa5723e08.cookies) return 'SOON!';
            return 'ETA: ' + $424feee8fe7c6c95$export$bc733b0c5cbb3e8a((targetCookies - $424feee8fe7c6c95$export$985739bfa5723e08.cookies) / this.realCps);
        };
        const run = ()=>{
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
                this.log(`🟡 Waiting to buy new upgrade: ${upgrades.nextWait.name}`, waitTime(upgrades.nextWait.getPrice()));
                return;
            }
            if (threshold.available) {
                const { obj: obj , toBuy: toBuy , nextAmount: nextAmount  } = threshold;
                const { amount: amount  } = obj;
                this.buy(obj, toBuy);
                this.log(`🚀 To the moon: Bought from ${amount} → ${nextAmount} of ${obj.name}`);
                return;
            }
            if (threshold.wait) {
                this.log(`🟡 Waiting to buy to threshold for ${threshold.obj.name} - ${$424feee8fe7c6c95$export$e251d23bea783311(threshold.nextPrice)}`, waitTime(threshold.nextPrice));
                return;
            }
            if (santa.buy) {
                this.buy({
                    buy: ()=>$424feee8fe7c6c95$export$985739bfa5723e08.UpgradeSanta()
                });
                return this.log('🎅 Ho Ho Ho!');
            }
            if (santa.wait) return this.log(`🎅 Twas the night before X-MAS!`, waitTime(santa.price));
            if (buildings.nextNew) {
                this.buy(buildings.nextNew);
                this.log(`🏛 Bought new building type: ${buildings.nextNew.name}`);
                return;
            }
            if (buildings.nextWait) {
                this.log(`🟡 Waiting to buy new building type: ${buildings.nextWait.name}`, waitTime(buildings.nextWait.price));
                timeout *= 10;
                return;
            }
            if (buildings.next) {
                if (buildings.next.price <= $424feee8fe7c6c95$export$985739bfa5723e08.cookies) {
                    this.buy(buildings.next);
                    this.log(`🏛 Bought building: ${buildings.next.name}`);
                    return;
                }
                this.log(`⏲ Waiting to buy building: ${buildings.sorted[0]?.name}`, waitTime(buildings.sorted[0].price));
                timeout *= 5;
                return;
            }
            this.log("💰 You're too poor... but that's a good thing!");
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
        console.log('%cBuy Order:', 'font-weight:bold');
        for (const obj of buildings.sorted)console.log('   - %s: %sx', obj.name, obj.relativeValue);
        console.log(`upgradeFatigue: ${Math.round(this.upgradeFatigue * 100) / 100}x`);
        console.log('%cLast %d log messages (window.__automateLog):', 'font-weight:bold', this.options.showLogs);
        for (const { time: time , msg: msg , count: count , extra: extra  } of this.logMessages.slice(-1 * this.options.showLogs))console.log('%c%s%c %s %c%s %c%s', 'color:gray', new Date(time).toISOString().slice(11, 19), 'color:white', msg, 'color:gray', count > 1 ? `✕ ${count}` : '', 'color:gray', extra ? '| ' + extra : '');
    }
}



setTimeout(()=>{
    $424feee8fe7c6c95$export$90b4d2ff6acb88af.myCookieAutomator?.stop();
    $424feee8fe7c6c95$export$90b4d2ff6acb88af.myCookieAutomator = new $fe57486f6f15e392$export$2e2bcd8739ae039;
    $424feee8fe7c6c95$export$90b4d2ff6acb88af.myCookieAutomator.start();
// console.log('>>', myCookieAutomator.getCps('Cursor'));
// console.log('% =', Math.round(myCookieAutomator.getCps('Grandma') / 341437 * 100));
}, 100);
'🍪🚜';


