import { Buyable, Upgrade } from '.';

export type Building = (
    | AlchemyLab
    | AntimatterCondenser
    | Bank
    | Chancemaker
    | CortexBaker
    | Cursor
    | Factory
    | Farm
    | FractalEngine
    | Grandma
    | Idleverse
    | JavascriptConsole
    | Mine
    | Portal
    | Prism
    | Shipment
    | Temple
    | TimeMachine
    | WizardTower
);

export type BuildingName = Building['name'];

interface DefaultBuilding extends Buyable {
    name: string;
    baseCps: number;
    basePrice: number;
    grandma?: Upgrade;
    tooltip: () => string;
    /** returns base cps? I think i dunno it's very confusing */
    cps: (me: DefaultBuilding) => number;
    amount: number;
    locked: boolean;
    price: number;
    plural: string;
    sell: (amount?: number) => void;
}

export interface AlchemyLab extends DefaultBuilding {
    name: 'Alchemy lab';
}

export interface AntimatterCondenser extends DefaultBuilding {
    name: 'Antimatter condenser';
}

export interface Bank extends DefaultBuilding {
    name: 'Bank';
}

export interface Chancemaker extends DefaultBuilding {
    name: 'Chancemaker';
}

export interface CortexBaker extends DefaultBuilding {
    name: 'Cortex baker';
}

export interface Cursor extends DefaultBuilding {
    name: 'Cursor';
}

export interface Factory extends DefaultBuilding {
    name: 'Factory';
}

export interface Farm extends DefaultBuilding {
    name: 'Farm';
}

export interface FractalEngine extends DefaultBuilding {
    name: 'Fractal engine';
}

export interface Grandma extends DefaultBuilding {
    name: 'Grandma';
}

export interface Idleverse extends DefaultBuilding {
    name: 'Idleverse';
}

export interface JavascriptConsole extends DefaultBuilding {
    name: 'Javascript console';
}

export interface Mine extends DefaultBuilding {
    name: 'Mine';
}

export interface Portal extends DefaultBuilding {
    name: 'Portal';
}

export interface Prism extends DefaultBuilding {
    name: 'Prism';
}

export interface Shipment extends DefaultBuilding {
    name: 'Shipment';
}

export interface Temple extends DefaultBuilding {
    name: 'Temple';
}

export interface TimeMachine extends DefaultBuilding {
    name: 'Time machine';
}

export interface WizardTower extends DefaultBuilding {
    name: 'Wizard tower';
    minigameLoaded: boolean;
    minigame?: GrimoireMinigame;
}

interface GrimoireMinigame {
    name: 'Grimoire';
    /** current magic value */
    magic: number;
    /** max magic value */
    magicM: number;
    /** magic generation per second */
    magicPS: number;
    castSpell: (spell: Spell) => boolean;
    getFailChance: (spell: Spell) => number;
    getSpellCost: (spell: Spell) => number;
    spellTooltip: (id: number) => string;
    spells: { [Name in Spell['name']]: Spell & { name: Name } };
    spellsById: Spell[];
    spellsCast: number;
    spellsCastTotal: number;
}

export interface Spell {
    costMin: number;
    costPercent: number;
    desc: string;
    fail: () => void;
    failDesc: string;
    id: number;
    win: () => void;
    name: (
        | 'conjure baked goods'
        | 'hand of fate'
        | 'stretch time'
        | 'spontaneous edifice'
        | 'haggler\'s charm'
        | 'summon crafty pixies'
        | 'gambler\'s fever dream'
        | 'resurrect abomination'
        | 'diminish ineptitude'
    );
}
