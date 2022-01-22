import type { Options } from './typeDefs';
import { Game } from './utils';

const getLSKey = (name: string) =>
    `CookieAutomator_${name}_${Game.version}_${Game.beta}`;

const options: Readonly<Options> = {
    status: 'on',
    tickMs: 5,
    showLogs: 25,
    buildingWait: 0.35,
    upgradeWait: 0.35,
    autoReloadMinutes: 0,
    achievementThresholds: {
        Default: [1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650],
        Cursor: [1, 2, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
    bannedUpgrades: {
        'Elder Covenant': true, // don't stop, can't stop, won't stop the grandmapocalypse
        // 'Elder Pledge': true, // peace was never an option
    },
    grandmapocalypse: {
        enabled: false,
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
        uiConfig: getLSKey('uiConfig'),
    },
    pantheon: {
        layout: ['ruin', 'mother', 'labor'],
        sellForRuin: ['Mine', 'Factory', 'Bank', 'Shipment', 'Alchemy lab'],
    },
    garden: {
        strategies: [
            {
                name: 'Optimal mutations',
                conditions: { minSeeds: 0 },
                optimalMutationStrategy: true,
                maxCpsBuff: 10,
                soil: 'woodchips',
                defaultOdds: { default: 1, weed: 0.5 },
            },
            {
                name: 'Focus on CPS',
                conditions: { minSeeds: 30 },
                usedPlotsRatio: 1,
                harvestDecayTicks: 1,
                maxCpsBuff: 1.5,
                soil: 'clay',
                defaultOdds: { default: 0.5, weed: 0.125 },
                plantOdds: {
                    bakerWheat: 1,
                    thumbcorn: 3,
                    cronerice: 0.125,
                    gildmillet: 1.25,
                    chocoroot: 1.5,
                },
            },
            {
                name: 'Max Golden Cookies',
                maxCpsBuff: 7, // allow Frenzy
                harvestDecayTicks: 0, //  don't need to harvest these
                conditions: {
                    minSeeds: 20,
                    seends: ['goldenClover'],
                },
                soil: 'clay',
                layout: () => 'goldenClover',
            },
            {
                name: 'Max Golden Cookies w/ Tulips',
                maxCpsBuff: 7, // allow Frenzy
                harvestDecayTicks: 0, //  don't need to harvest these
                conditions: {
                    minSeeds: 20,
                    seends: ['goldenClover', 'nursetulip'],
                },
                soil: 'clay',
                layout: ({ x, y }) =>
                    (x === 1 || x === 4) && (y === 1 || y === 4)
                        ? 'nursetulip'
                        : 'goldenClover',
            },
        ],
    },
    season: {
        default: 'christmas',
        exclude: ['fools'],
    },
};

export const msToTicks = (ms: number) => Math.max(1, Math.floor(ms / options.tickMs));

export default options;
