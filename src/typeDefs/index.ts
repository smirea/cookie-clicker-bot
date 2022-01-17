import type Automator from 'src/Automator';
import { Building, BuildingName, Garden, Pantheon } from './buildings';

export * from './buildings';

export const STATUSES = ['off', 'on', 'click'] as const;

declare global {
    interface Window {
        Automator: Automator;
    }
}

export type ReactUpdater = (changes: Array<'options' | 'lastState'>) => void;
export type ContextConnector = (updater: ReactUpdater) => void;

export interface Options {
    status: typeof STATUSES[number];
    /**
     * Delay between each game loop (in ms)
     * Good idea to keep it >= 4ms
     */
    tickMs: number;
    showLogs: number;
    /** what % [0-1] of the building price to start waiting to buy */
    buildingWait: number;
    /** what % [0-1] of the upgrade price to start waiting to buy */
    upgradeWait: number;
    /**
     * refresh the page every X minutes if there isn't an active buff.
     * @deprecated not needed, page does not crash if left open
     */
    autoReloadMinutes: 0;
    achievementThresholds: (
        { Default: number[] } &
        { [key in BuildingName | 'Default']?: number[]; }
    );
    bannedUpgrades: Record<string, boolean>;
    grandmapocalypse: {
        /** grandmapocalypse causes wrath cookies which seem to be worse overall. It is mainly useful when idling */
        enabled: boolean;
    },
    dragon: {
        /** for each dragon purchase type, at what cookie % should you start waiting */
        waitRatios: {
            cookie: number,
            building: number,
            all: number,
        },
        /** order in which aura is chosen. If it's not on this list, it won't be selected */
        auras: Array<GameT['dragonAuras'][number]['name']>,
    };
    localStorage: {
        log: string;
    };
    pantheon: {
        layout: [null | Pantheon.GodKey, null | Pantheon.GodKey, null | Pantheon.GodKey];
        /** Which buildings to sell to get the Godzamok buff. NOTE: multiple buildings stack but tooltip does not update */
        sellForRuin: BuildingName[];
    },
    garden: {
        strategies: Array<{
            name: string;
            conditions: {
                minSeeds: number;
            };
            optimalMutationStrategy?: boolean;
            /** leave N % of plots empty for mutations [0-1] */
            usedPlotsRatio?: number;
            /** harvest when there at most 1 tick left before decay */
            harvestDecayTicks?: number;
            /** if CPS % is greater, do not plant new seeds (default cps% = 1) */
            maxCpsBuff?: number;
            soil?: Garden.Soil['key'];
            defaultOdds?: {
                weed: number;
                default: number;
            },
            plantOdds?: { [key in Garden.Plant['key']]?: number };
        }>;
    };
    season: {
        default: SeasonKey;
        exclude: SeasonKey[];
    };
}

/**
 * window.Game
 */
export interface GameT {
    readonly version: number;
    readonly beta: number;
    /** total cookies */
    readonly cookies: number;
    /** total CPS */
    readonly cookiesPs: number;
    /** How many cookies / click */
    readonly computedMouseCps: number;
    readonly globalCpsMult: number;
    /** Date.now() when the current sugar lump was created */
    readonly lumpT: number;
    readonly lumpMatureAge: number;
    /** the name of the game */
    readonly ClickCookie: (event?: MouseEvent) => void;
    /** pet the dragon */
    readonly ClickSpecialPic: () => void;
    readonly clickLump: () => void;
    readonly Has: (upgrade: string) => boolean;
    readonly Objects: { [Name in BuildingName]: Building & { name: Name } };
    readonly ObjectsById: Building[];
    readonly Upgrades: Record<string, Upgrade>;
    readonly UpgradesInStore: Upgrade[];
    readonly santaLevel: number;
    readonly santaLevels: string[];
    readonly UpgradeSanta: () => number;
    readonly getWrinklersMax: () => number;
    readonly PopRandomWrinkler: () => void;
    readonly CollectWrinklers: () => void;
    readonly buffs: Record<string, Buff>;
    readonly dragonLevel: number;
    readonly dragonLevels: DragonLevel[];
    readonly UpgradeDragon: () => void;
    readonly SetDragonAura: (aura: number, slot: 0 | 1) => void;
    readonly dragonAura: number;
    readonly dragonAura2: number;
    readonly dragonAuras: Array<{ name: string; desc: string }>;
    /** returns if the aura is the currently active one, NOT if it is available */
    readonly hasAura: (name: string) => boolean;
    readonly ClosePrompt: () => void;
    readonly hasBuff: (buffName: Buff['name']) => boolean;
    readonly shimmers: Array<{
        type: 'reindeer' | 'golden';
        dur: number;
        l: HTMLDivElement;
        wrath: 0 | 1;
        life: number;
    }>;
    readonly ToggleSpecialMenu: (on: 0 | 1) => void;
    readonly Achievements: Record<string, {
        name: string;
        won: 0 | 1;
        desc: string;
        order: number;
        diabled: 0 | 1;
    }>;
    readonly season: SeasonKey;
    readonly seasons: Record<SeasonKey, Season>;
    readonly tickerL: HTMLDivElement;
    /** the news ticker message */
    readonly Ticker: string;
    readonly TickerEffect: number | { type: 'fortune' };
    readonly BuildAscendTree: () => void;
    /** 1 when in the ascention screen */
    readonly OnAscend: 0 | 1;
    /** it's non-0 during the ascend animation */
    readonly AscendTimer: number;
    readonly prefs: Record<string, any>;
    readonly GrandmaSynergies: Upgrade['name'][];

    // ---- Season stuff ----

    readonly GetHowManyEggs: () => number;
    readonly GetHowManyHalloweenDrops: () => number;
    readonly GetHowManyHeartDrops: () => number;
    readonly GetHowManyReindeerDrops: () => number;
    readonly GetHowManySantaDrops: () => number;
    readonly easterEggs: Array<Upgrade['name']>;
    readonly eggDrops: Array<Upgrade['name']>;
    readonly halloweenDrops: Array<Upgrade['name']>;
    readonly heartDrops: Array<Upgrade['name']>;
    readonly rareEggDrops: Array<Upgrade['name']>;
    readonly reindeerDrops: Array<Upgrade['name']>;
    readonly santaDrops: Array<Upgrade['name']>;
    readonly seasonDrops: Array<Upgrade['name']>;

    // ---- Actually writeable props ----

    promptOn: 0 | 1;
    wrinklers: Wrinkler[];
    specialTab: string;
    permanentUpgrades: number[];
    volume: number;
}

export type SeasonKey = (
    | 'christmas'
    | 'easter'
    | 'fools'
    | 'halloween'
    | 'valentines'
);

export interface Season {
    name: string;
    over: string;
    start: string;
    trigger: Upgrade['name'];
    triggerUpgrade: Upgrade;
}

export interface Buyable {
    name: string;
    buy: (amount: number) => void;
    bought: number;
}

export interface Upgrade extends Buyable {
    id: number;
    type: 'upgrade';
    pool: '' | 'cookie' | 'debug' | 'prestige' | 'tech' | 'toggle';
    desc: string;
    unlocked: boolean;
    getPrice: () => number;
    canBuy: () => boolean;
    buy: () => 0 | 1;
    tier: number | 'synergy1' | 'synergy2' | 'fortune';
    buildingTie?: Building;
    buildingTie1?: Building;
    buildingTie2?: Building;
}

export interface Buff {
    name: string;
    add: boolean;
    time: number;
    maxTime: number;
    visible: boolean;
    desc: string;
    multCpS?: number;
    multClick?: number;
    aura: number;
}

export interface DragonLevel {
    name: string;
    action: string;
    /** @deprecated only sells shit, doesn't actually upgrade. DO NOT CALL */
    buy: () => void;
    cost: () => boolean;
    costStr: () => string;
}

export type DragonLevelGoal = (
    { cookies: number; amount: number; buy: () => void } & (
        | { type: 'cookie' }
        | { type: 'all' }
        | { type: 'building', value: BuildingName }
    )
);

export type Wrinkler = {
    close: number;
    hp: number;
    hurt: number;
    id: number;
    phase: number;
    r: number;
    selected: number;
    sucked: number;
    type: number;
    x: number;
    y: number;
};

export interface BuildingMeta {
    name: Building['name'];
    price: number;
    basePrice: number;
    amount: number;
    locked: boolean;
    cps: number;
    bought: number;
    pricePerCps: number;
    relativeValue: number;
    building: Building;
}
