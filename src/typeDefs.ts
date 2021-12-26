/**
 * window.Game
 */
export interface GameT {
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
    buffs: Record<string, Buff>;
}

export type BuildingName = 'Cursor' | 'Grandma' | 'Farm' | 'Mine' | 'Factory' | 'Bank' | 'Temple' | 'Wizard tower' | 'Shipment' | 'Alchemy lab' | 'Portal' | 'Time machine' | 'Antimatter condenser' | 'Prism' | 'Chancemaker' | 'Fractal engine' | 'Javascript console' | 'Idleverse' | 'Cortex baker';

export interface Buyable {
    name: string;
    buy: (amount: number) => number;
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
