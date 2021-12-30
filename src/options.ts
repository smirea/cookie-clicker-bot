import { Options } from './typeDefs';
import { Game } from './utils';

const getLSKey = (name: string) =>
    `CookieAutomator_${name}_${Game.version}_${Game.beta}`;

const options: Options = {
    cookieClickTimeout: 1000 / 15.1, // sneaky
    showLogs: 25,
    buildingWait: 0.35, // what % [0-1] of the building price to start waiting to buy
    upgradeWait: 0.35, // what % [0-1] of the upgrade price to start waiting to buy
    wrinklerPopTime: 8 * 60e3, // pop a wrinkler every X ms
    // note: disabled for now, re-enable if page crashes
    autoReloadMinutes: 0, // refresh the page every X minutes if there isn't an active buff
    achievementThresholds: {
        Default: [1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600],
        Cursor: [1, 2, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
    bannedUpgrades: {
        'Elder Covenant': true, // don't stop, can't stop, won't stop the grandmapocalypse
        'Elder Pledge': true, // peace was never an option
    },
    dragon: {
        /** for each dragon purchase type, at what cookie % should you start waiting */
        waitRatios: {
            cookie: 0.4,
            building: 0.6,
            all: 0.75,
        },
        /** order in which aura is chosen. If it's not on this list, it won't be selected */
        auras: [
            'Radiant Appetite',
            'Dragonflight',
            'Breath of Milk',
        ],
    },
    localStorage: {
        log: getLSKey('log'),
    },
    garden: {
        /** leave 50% of plots empty for mutations */
        usedPlotsRatio: 0.5,
        /** harvest when there at most 1 tick left before decay */
        harvestDecayTicks: 1,
        /** if CPS % is greated, do not plant new seeds (default cps% = 1) */
        maxCpsBuff: 1,
        soil: 'fertilizer',
        plantOdds: {
            bakerWheat: 1,
            thumbcorn: 0.75,
            cronerice: 0.5,
        },
    },
};

export default options;
