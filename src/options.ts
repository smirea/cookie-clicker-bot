import { Options } from './typeDefs';
import { Game } from './utils';

const getLSKey = (name: string) =>
    `CookieAutomator_${name}_${Game.version}_${Game.beta}`;

const options: Readonly<Options> = {
    tickMs: 5,
    showLogs: 25,
    buildingWait: 0.35,
    upgradeWait: 0.35,
    autoReloadMinutes: 0,
    achievementThresholds: {
        Default: [1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600],
        Cursor: [1, 2, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
    bannedUpgrades: {
        'Elder Covenant': true, // don't stop, can't stop, won't stop the grandmapocalypse
        'Elder Pledge': true, // peace was never an option
    },
    dragon: {
        waitRatios: {
            cookie: 0.4,
            building: 0.6,
            all: 0.75,
        },
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
        usedPlotsRatio: 0.55,
        harvestDecayTicks: 1,
        maxCpsBuff: 1,
        soil: 'fertilizer',
        plantOdds: {
            bakerWheat: 1,
            thumbcorn: 0.75,
            cronerice: 0.25,
            gildmillet: 1.25,
            brownMold: 0.125,
            meddleweed: 0.125,
            chocoroot: 1.5,
        },
    },
};

export const msToTicks = (ms: number) => Math.max(1, Math.floor(ms / options.tickMs));

export default options;
