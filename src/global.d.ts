interface Window {
    __automateLog: LogMessage[];
}

interface LogMessage {
    time: number;
    msg: string;
    count: number;
}

/**
 * window.Game
 */
declare namespace Game {
    /** total cookies */
    const cookies: number;
    /** total CPS */
    const cookiesPS: number;
    /** Date.now() when the current sugar lump was created */
    const lumpT: number;
    const clickLump: () => void;
    const Objects: Record<BuildingName, Building>;
    const ObjectsById: Building[];
    const Upgrades: Record<string, Upgrade>;
    /** >= 1 <= 14 */
    const santaLevel: number;
    const UpgradeSanta: () => number;
}

type BuildingName = 'Cursor' | 'Grandma' | 'Farm' | 'Mine' | 'Factory' | 'Bank' | 'Temple' | 'Wizard tower' | 'Shipment' | 'Alchemy lab' | 'Portal' | 'Time machine' | 'Antimatter condenser' | 'Prism' | 'Chancemaker' | 'Fractal engine' | 'Javascript console' | 'Idleverse' | 'Cortex baker';

interface Buyable {
    name: string;
    buy: (amount: number) => number;
    bought: number;
    price: number;
}

interface Building extends Buyable {
    name: BuildingName;
    baseCps: number;
    basePrice: number;
    grandma?: Upgrade;
    tooltip: () => string;
    /** returns base cps? I think i dunno it's very confusing */
    cps: (me: this) => number;
    amount: number;
    locked: boolean;
}

interface Upgrade extends Buyable {
    type: 'upgrade';
    pool: string;
    desc: string;
    unlocked: boolean;
    getPrice: () => number;
    canBuy: () => boolean;
}
