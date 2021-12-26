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
    readonly Objects: Record<BuildingName, Building>;
    readonly ObjectsById: Building[];
    readonly Upgrades: Record<string, Upgrade>;
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
}

export type BuildingName = 'Cursor' | 'Grandma' | 'Farm' | 'Mine' | 'Factory' | 'Bank' | 'Temple' | 'Wizard tower' | 'Shipment' | 'Alchemy lab' | 'Portal' | 'Time machine' | 'Antimatter condenser' | 'Prism' | 'Chancemaker' | 'Fractal engine' | 'Javascript console' | 'Idleverse' | 'Cortex baker';

export interface Buyable {
    name: string;
    buy: (amount: number) => void;
    bought: number;
}

export interface Building extends Buyable {
    name: BuildingName;
    baseCps: number;
    basePrice: number;
    grandma?: Upgrade;
    tooltip: () => string;
    /** returns base cps? I think i dunno it's very confusing */
    cps: (me: this) => number;
    amount: number;
    locked: boolean;
    price: number;
    plural: string;
    sell: (amount?: number) => void;
}

export interface Upgrade extends Buyable {
    type: 'upgrade';
    pool: string;
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
