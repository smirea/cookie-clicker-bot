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
    amount: number;
    baseCps: number;
    basePrice: number;
    /** returns base cps? I think i dunno it's very confusing */
    cps: (me: DefaultBuilding) => number;
    grandma?: Upgrade;
    level: number;
    locked: boolean;
    name: string;
    plural: string;
    price: number;
    sell: (amount?: number) => void;
    tooltip: () => string;
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
    minigameLoaded: boolean;
    minigame?: Garden.Minigame;
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
    minigame?: Grimoire.Minigame;
}

export namespace Grimoire {
    export interface Minigame {
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
}

export namespace Garden {
    export interface Minigame {
        readonly name: 'Garden';
        readonly canPlant: (plant: Plant) => boolean;
        readonly clickTile: (x: number, y: number) => void;
        readonly harvests: number;
        readonly harvestsTotal: number;
        readonly effs: Record<string, number>;
        readonly freeze: number;
        readonly harvest: (x: number, y: number) => boolean;
        readonly getCost: (plant: Plant) => number;
        readonly getTile: (x: number, y: number) => Tile;
        readonly isTileUnlocked: (x: number, y: number) => boolean;
        readonly nextFreeze: number;
        readonly nextSoil: number;
        readonly nextStep: number;
        readonly plants: Record<string, Plant>;
        readonly plantsById: Plant[];
        readonly plantsN: number;
        readonly plantsUnlockedN: number;
        readonly plot: Array<Tile[]>;
        readonly plotBoost: Array<Array<[wtf1: number, wtf2: number, wtf3: number]>>;
        readonly plotLimits: Array<[x1: number, y1: number, x2: number, y2: number]>;
        readonly soil: Soil['id'];
        readonly soils: { [Key in Soil['key']]: Soil & { name: Key } }
        readonly soilsById: Soil[];
        readonly stepT: number;

        // actually writeable props
        seedSelected: Plant['id'] | -1;
    }

    export type Tile = [PlantId: number, age: number];

    export interface Plant {
        id: number;
        name: string;
        key: PlantKey;
        ageTick: number;
        ageTickR: number;
        children: Plant['key'][];
        cost: number;
        costM: number;
        effsStr: string;
        fungus?: boolean;
        immortal?: boolean;
        mature: number;
        matureBase: number;
        onHarvest?: (x: number, y: number, age: number) => void;
        plantable: boolean;
        unlocked: 0 | 1;
    }

    export interface Soil {
        id: number;
        name: string;
        key: 'clay' | 'dirt' | 'fertilizer' | 'pebbles' | 'woodchips';
        effMult: number;
        /** effect description */
        effsStr: string;
        /** how many farms are required */
        req: number;
        q: string;
        tick: number;
        weedMult: number;
    }

    export interface Tool {
        id: number;
        name: string;
        key: string;
        isDisplayed(): boolean;
        func(): void;
    }

    export type PlantKey = (
        | 'bakerWheat'
        | 'thumbcorn'
        | 'cronerice'
        | 'gildmillet'
        | 'clover'
        | 'goldenClover'
        | 'shimmerlily'
        | 'elderwort'
        | 'bakeberry'
        | 'chocoroot'
        | 'whiteChocoroot'
        | 'whiteMildew'
        | 'brownMold'
        | 'meddleweed'
        | 'whiskerbloom'
        | 'chimerose'
        | 'nursetulip'
        | 'drowsyfern'
        | 'wardlichen'
        | 'keenmoss'
        | 'queenbeet'
        | 'queenbeetLump'
        | 'duketater'
        | 'crumbspore'
        | 'doughshroom'
        | 'glovemorel'
        | 'cheapcap'
        | 'foolBolete'
        | 'wrinklegill'
        | 'greenRot'
        | 'shriekbulb'
        | 'tidygrass'
        | 'everdaisy'
        | 'ichorpuff'
    );
}
