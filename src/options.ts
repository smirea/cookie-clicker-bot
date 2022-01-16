import { Options } from './typeDefs';
import { Game } from './utils';

const getLSKey = (name: string) =>
    `CookieAutomator_${name}_${Game.version}_${Game.beta}`;

const options: Readonly<Options> = {
    startupState: 'on',
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
    pantheon: {
        layout: ['ruin', 'labor', 'scorn'],
        sellForRuin: ['Mine', 'Factory', 'Bank', 'Temple'],
    },
    garden: {
        strategies: [
            // {
            //     name: 'Focus on new seeds',
            //     conditions: { minSeeds: 0 },
            //     usedPlotsRatio: 0.5,
            //     harvestDecayTicks: 10,
            //     maxCpsBuff: 1,
            //     soil: 'fertilizer',
            //     defaultOdds: { default: 1, weed: 0.5 },
            //     plantOdds: {
            //         bakerWheat: 1,
            //         thumbcorn: 2,
            //         cronerice: 0.25,
            //         gildmillet: 1.25,
            //         chocoroot: 1.5,
            //     },
            // },
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
                conditions: { minSeeds: 20 },
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
        ],
    },
    season: {
        default: 'christmas',
        exclude: ['fools'],
    },
};

export const msToTicks = (ms: number) => Math.max(1, Math.floor(ms / options.tickMs));

export default options;
