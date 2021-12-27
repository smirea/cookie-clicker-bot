import { Building, BuildingName } from './buildings';

export * from './buildings';

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
    /** Date.now() when the current sugar lump was created */
    readonly lumpT: number;
    readonly clickLump: () => void;
    readonly Objects: { [Name in BuildingName]: Building & { name: Name } };
    readonly ObjectsById: Building[];
    readonly Upgrades: Record<string, Upgrade>;
    readonly UpgradesInStore: Upgrade[];
    /** >= 1 <= 14 */
    readonly santaLevel: number;
    readonly UpgradeSanta: () => number;
    readonly PopRandomWrinkler: () => void;
    readonly CollectWrinklers: () => void;
    readonly buffs: Record<string, Buff>;
    readonly dragonLevel: number;
    readonly dragonLevels: DragonLevel[];
    readonly UpgradeDragon: () => void;
    readonly SetDragonAura: (aura: number, slot: 0 | 1) => void;
    readonly dragonAuras: Array<{ name: string; desc: string }>;
    /** returns if the aura is the currently active one, NOT if it is available */
    readonly hasAura: (name: string) => boolean;
    readonly ClosePrompt: () => void;
    readonly shimmers: Array<{
        type: 'reindeer' | 'golden';
        dur: number;
        l: HTMLDivElement;
        wrath: 0 | 1;
        life: number;
    }>;

    // Actually writeable props!

    promptOn: 0 | 1;
    wrinklers: Wrinkler[];
}

export interface Buyable {
    name: string;
    buy: (amount: number) => void;
    bought: number;
}

export interface Upgrade extends Buyable {
    type: 'upgrade';
    pool: '' | 'cookie' | 'debug' | 'prestige' | 'tech' | 'toggle';
    desc: string;
    unlocked: boolean;
    getPrice: () => number;
    canBuy: () => boolean;
}

export interface Buff {
    name: string;
    add: boolean;
    time: number;
    maxTime: number;
    visible: boolean;
    desc: string;
    multCpS: number;
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
    { cookies: number; amount: number } & (
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

export interface BuildingStats {
    next?: Building;
    nextNew?: Building;
    nextWait?: Building;
    nextHighValue?: null | { obj: Building; amount: number };
    sorted: Array<{
        name: string;
        price: number;
        cps: number;
        pricePerCps: number;
        index: number;
        obj: Building;
        relativeValue: number;
    }>
}
