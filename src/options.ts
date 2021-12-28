import { Game } from './utils';

const getLSKey = (name: string) =>
    `CookieAutomator_${name}_${Game.version}_${Game.beta}`;

const options = {
    cookieClickTimeout: 1000 / 15.1, // sneaky
    showLogs: 25,
    buildingWait: 0.35, // what % [0-1] of the building price to start waiting to buy
    upgradeWait: 0.35, // what % [0-1] of the upgrade price to start waiting to buy
    wrinklerPopTime: 8 * 60e3, // pop a wrinkler every X ms
    // note: disabled for now, re-enable if page crashes
    autoReloadMinutes: 0, // refresh the page every X minutes if there isn't an active buff
    achievementThresholds: {
        Cursor: [1, 2, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
        Default: [1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600],
    } as Record<string, number[]>,
    bannedUpgrades: {
        'Elder Covenant': true, // don't stop, can't stop, won't stop the grandmapocalypse
        'Elder Pledge': true, // peace was never an option
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
    localStorage: {
        log: getLSKey('log'),
    },
};

export default options;
