import { clamp, Game, sample } from 'src/utils';
import Timer from 'src/timers/Timer';
import { Garden, Options } from 'src/typeDefs';
import options, { msToTicks } from 'src/options';

export default class GardenMinigameTimer extends Timer {
    type = 'clicker' as const;

    defaultTimeout = msToTicks(1000);

    startDelay() { return this.defaultTimeout; }

    strategy!: Required<Options['garden']['strategies'][number]>;

    execute(): void {
        const garden = this.garden;
        if (!garden) return this.scaleTimeout(10); // git gud first

        const { totalPlots, lvl, x1, x2, y1, y2 } = this.config;
        this.setStrategy();
        this.setSoil();

        const emptyPlots: Coordinate[] = [];
        const usedPlots: Array<Coordinate & { age: number; plant: Garden.Plant }> = [];
        const layout = MUTATION_LAYOUTS.double[lvl](x1, y1);
        const shouldHarvest = (plant: Garden.Plant, x: number, y: number, age: number) => {
            const isMature = age >= plant.mature;
            const isWeed = !!(plant.weed || ['brownMold'].includes(plant.key));
            const isCloseToDeath = isMature && (isWeed || this.getDecayTicks(x, y) <= this.strategy.harvestDecayTicks);

            if (plant.immortal && age >= plant.mature * 3) return true;

            if (this.strategy.optimalMutationStrategy) {
                if (isWeed) return true;
                if (layout.get(x, y)) return isCloseToDeath;
                return isMature;
            }

            return isCloseToDeath;
        }

        for (let x = x1; x < x2; ++x) {
            for (let y = y1; y < y2; ++y) {
                const tile = garden.getTile(x, y);
                const [plantId, age] = tile;

                if (!plantId) {
                    emptyPlots.push({ x, y });
                    continue;
                }

                const plant = garden.plantsById[plantId - 1];

                if (shouldHarvest(plant, x, y, age)) {
                    if (garden.harvest(x, y)) {
                        this.context.log(`🥀 Harvested ${plant.name} at [${x - x1}, ${y - y1}]`);
                        emptyPlots.push({ x, y });
                        return;
                    }
                }

                usedPlots.push({ x, y, plant, age });
            }
        }

        if (this.strategy.optimalMutationStrategy) {
            return void this.runOptimalMutationStrategy(layout);
        }

        // wait for stuff to be done if too many plots are used
        if (!emptyPlots.length || usedPlots.length >= totalPlots * this.strategy.usedPlotsRatio) return;

        const { cpsMultiple } = this.context.getBuffs();
        if (cpsMultiple > this.strategy.maxCpsBuff) return;

        const availablePlants = garden.plantsById.filter(p => p.unlocked && garden.canPlant(p));
        if (!availablePlants.length) return;

        const plantOptions = availablePlants
            .map(plant => {
                const base = this.strategy.plantOdds[plant.key];
                return {
                    key: plant.key,
                    plant,
                    odds: clamp(
                        typeof base === 'number'
                            ? base
                            : plant.weed
                                ? this.strategy.defaultOdds.weed
                                : this.strategy.defaultOdds.default,
                        0,
                        10,
                    ),
                };
            });
        const value = Math.random() * plantOptions.reduce((s, x) => s + x.odds, 0);
        let sum = 0;
        const toPlant = plantOptions.find(x => {
            sum += x.odds;
            return value <= sum;
        })!.plant;
        const { x, y } = emptyPlots[Math.floor(emptyPlots.length * Math.random())];
        this.plant(toPlant, x, y);
    }

    get garden() { return Game.Objects.Farm.minigame; }

    get config() {
        const garden = this.garden!;
        const lvl = Math.min(Game.Objects.Farm.level - 1, garden.plotLimits.length);
        const [x1, y1, x2, y2] = garden.plotLimits[lvl];
        const totalPlots = (x2 - x1) * (y2 - y1);

        return {
            garden,
            lvl,
            x1,
            x2,
            y1,
            y2,
            totalPlots,
        } as const;
    }

    plant (plant: Garden.Plant, x: number, y: number) {
        const { garden, x1, y1 } = this.config;
        if (!plant.unlocked || !garden.canPlant(plant)) return false;
        garden.seedSelected = plant.id;
        garden.clickTile(x, y);
        this.context.log(`🌷 Planted ${plant.name} at [${x - x1}, ${y - y1}]: ${plant.effsStr}`);
        return true;
    }

    runOptimalMutationStrategy(layout: Layout) {
        const { garden, x1, x2, y1, y2 } = this.config;

        const getParents = (ox: number, oy: number) => {
            const parents: Garden.Plant[] = [];
            for (let x = ox - 1; x <= ox + 1; ++x) {
                for (let y = oy - 1; y < oy + 2; ++y) {
                    if (x === ox && y === oy) continue;
                    const tile = garden.getTile(x, y);
                    if (!tile[0]) continue;
                    parents.push(garden.plantsById[tile[0] - 1]);
                }
            }
            return parents;
        }

        for (let x = x1; x < x2; ++x) {
            for (let y = y1; y < y2; ++y) {
                const [plantId] = garden.getTile(x, y);
                if (plantId) continue; // already a seed

                const target = layout.get(x, y);
                if (!target) continue; // it's supposed to be empty

                const parents = getParents(x, y);

                const plantIndependent = () => {
                    const options = garden.plantsById
                        .filter(plant => !plant.unlocked)
                        .map(plant => MUTATION_RULES[plant.key].map(opt => ({ plant, ...opt })))
                        .flat()
                        .filter(option => option.parents.every(key => garden.plants[key].unlocked));

                    if (!options.length) return;

                    const choice = sample(options);
                    const toPlant = garden.plants[sample(choice.parents)];
                    if (toPlant.weed) return;

                    // console.log('0 | plant %s at [%d, %d] to get %s', toPlant.key, x, y, choice.plant.key);
                    this.plant(toPlant, x, y);
                }

                if (!parents.length) return plantIndependent();

                const mates = parents.map(parent =>
                    parent.children
                        .filter(key => key !== parent.key)
                        .map(key => garden.plants[key])
                        .filter(plant => !plant.unlocked)
                        .map(plant => MUTATION_RULES[plant.key].map(opt => ({ plant, ...opt })))
                        .flat()
                        .filter(option =>
                            option.parents.every(key => garden.plants[key].unlocked) &&
                            option.parents.some(key => key === parent.key)
                        )
                        .map(option => {
                            const r = Array.from(option.parents);
                            // splicing supports both duplicate parents and distinct parents
                            r.splice(option.parents.indexOf(parent.key), 1);

                            return {
                                child: option.plant.key,
                                parent: garden.plants[r[0]],
                            };
                        })
                        .filter(option => !option.parent.weed)
                ).flat();

                const other = sample(mates);
                if (other) {
                    // console.log('1 | plant %s at [%d, %d] to get %s', other.parent.key, x, y, other.child);
                    this.plant(other.parent, x, y);
                } else plantIndependent();

                return // lets do a single seed at a time
            }
        }
    }

    setStrategy() {
        const garden = this.garden!;
        const seeds = garden.plantsById.filter(p => p.unlocked).length;
        const active = options.garden.strategies.filter(s => seeds >= s.conditions.minSeeds);
        const nextStrategy = active[active.length - 1] || active[0];

        if (this.strategy?.name !== nextStrategy.name) {
            this.context.log('🏡 Garden strategy: ' + nextStrategy.name);
        }

        this.strategy = {
            usedPlotsRatio: 1,
            harvestDecayTicks: 1,
            maxCpsBuff: 1,
            soil: 'clay',
            defaultOdds: { default: 1, weed: 0.25 },
            plantOdds: {},
            optimalMutationStrategy: true,
            ...nextStrategy,
        };
    }

    setSoil() {
        const soil = this.garden?.soils[this.strategy.soil];
        if (!soil || this.garden!.soil === soil.id || soil.req > Game.Objects.Farm.amount) return;
        l('gardenSoil-' + soil.id)?.click();
        this.context.log(`🪴 Set soil to ${soil.name}\n${soil.effsStr}`);
    }

    /**
     * yoinked this horror directly from the game source code: garden.tileTooltip()
     *
     * @returns time in seconds
     */
    getMatureTime(x: number, y: number) {
        const M = this.garden!;
        const tile = M.getTile(x, y);
        const me = M.plantsById[tile[0] - 1];
        return ((100 / (M.plotBoost[y][x][0] * (me.ageTick + me.ageTickR / 2))) * ((me.mature - tile[1]) / 100) * M.stepT) * 30;
    }

    /**
     * yoinked this horror directly from the game source code: garden.tileTooltip()
     *
     * @returns time in seconds
     */
    getDecayTime(x: number, y: number) {
        const M = this.garden!;
        const tile = M.getTile(x, y);
        const me = M.plantsById[tile[0] - 1];
        return ((100 / (M.plotBoost[y][x][0] * (me.ageTick + me.ageTickR / 2))) * ((100 - tile[1]) / 100) * M.stepT) * 30;
    }

    /** yoinked this horror directly from the game source code: garden.tileTooltip() */
    getDecayTicks(x: number, y: number) {
        const M = this.garden!;
        const tile = M.getTile(x, y);
        const me = M.plantsById[tile[0] - 1];
        return Math.ceil(
            (100 / (M.plotBoost[y][x][0] * (me.ageTick + me.ageTickR / 2))) *
            ((100 - tile[1]) / 100)
        )
    }
}

type Coordinate = { x: number; y: number };

class Layout {
    width: number;
    height: number;

    constructor(public x1: number, public y1: number, public matrix: Array<Array<'1' | '2' | null>>) {
        this.height = matrix.length;
        this.width = matrix[0].length;
    }

    get(x: number, y: number) { return this.matrix[y - this.y1][x - this.x1]; }

    print() {
        for (const row of this.matrix) {
            console.log(row.map(x => x ? x : '.').join(' '));
        }
    }
}

const parseLayouts = (str: string) =>
    str.trim().split('\n\n').map(block =>
        (x1: number, y1: number) =>
            new Layout(
                x1,
                y1,
                block
                    .trim()
                    .split('\n')
                    .map(line =>
                        line.trim().split(/\s+/).map(ch => ch === '.' ? null : ch as '1' | '2')
                    )
            )
    );

// from: https://cookieclicker.fandom.com/wiki/Garden#Mutation_Setups
const MUTATION_LAYOUTS = {
    // single: parseLayouts(`
    //     1 1
    //     . .

    //     . 1 .
    //     . 1 .

    //     . . .
    //     1 1 1
    //     . . .

    //     . . . .
    //     1 1 1 1
    //     . . . .

    //     1 . . 1
    //     . . 1 .
    //     . 1 . .
    //     1 . . 1

    //     1 . 1 . 1
    //     . . . . .
    //     1 1 . 1 1
    //     . . . . .

    //     1 1 . 1 1
    //     . . . . .
    //     . . . . .
    //     1 1 . 1 1
    //     . . . . .

    //     . 1 . . 1 .
    //     . 1 . . 1 .
    //     . . . . . .
    //     . 1 . . 1 .
    //     . 1 . . 1 .

    //     . . . . . .
    //     1 1 . 1 1 1
    //     . . . . . .
    //     . . . . . .
    //     1 1 . 1 1 1
    //     . . . . . .
    // `),

    double: parseLayouts(`
        1 2
        . .

        . 1 .
        . 2 .

        . . .
        1 2 1
        . . .

        . . . .
        1 2 2 1
        . . . .

        1 . . 1
        . 2 . .
        . . 2 .
        1 . . 1

        1 . 2 . 1
        . . . . .
        . 2 . 1 2
        1 . . . .

        1 2 . 1 2
        . . . . .
        . . . . .
        1 2 . 1 2
        . . . . .

        . 1 . . 1 .
        . 2 . . 2 .
        . . . . . .
        . 1 . . 1 .
        . 2 . . 2 .

        . . . . . .
        1 2 1 . 2 1
        . . . . . .
        . . . . . .
        1 2 . 1 2 1
        . . . . . .
    `),
} as const;

// from: https://cookieclicker.fandom.com/wiki/Garden#Species
const MUTATION_RULES: Record<
    Garden.PlantKey,
    Array<{ odds: number, parents: Garden.PlantKey[] }>
> = {
    bakerWheat: [
        { odds: 0.2, parents: ['bakerWheat', 'bakerWheat'] },
        { odds: 0.05, parents: ['thumbcorn', 'thumbcorn'] },
    ],
    thumbcorn: [
        { odds: 0.05, parents: ['bakerWheat', 'bakerWheat'] },
        { odds: 0.1, parents: ['thumbcorn', 'thumbcorn'] },
        { odds: 0.02, parents: ['cronerice', 'cronerice'] },
    ],
    cronerice: [
        { odds: 0.01, parents: ['bakerWheat', 'thumbcorn'] },
    ],
    gildmillet: [
        { odds: 0.03, parents: ['cronerice', 'thumbcorn'] },
    ],
    clover: [
        { odds: 0.03, parents: ['bakerWheat', 'gildmillet'] },
        { odds: 0.007, parents: ['clover', 'clover'] },
    ],
    goldenClover: [
        { odds: 0.0007, parents: ['bakerWheat', 'gildmillet'] },
        // { odds: 0.0001, parents: ['clover', 'clover'] }, // not worth it, has extra requirements
        // 4 parents layout?!
    ],
    shimmerlily: [
        { odds: 0.02, parents: ['clover', 'gildmillet'] },
    ],
    elderwort: [
        { odds: 0.01, parents: ['shimmerlily', 'cronerice'] },
        { odds: 0.002, parents: ['wrinklegill', 'cronerice'] },
    ],
    bakeberry: [
        { odds: 0.001, parents: ['bakerWheat', 'bakerWheat'] },
    ],
    chocoroot: [
        { odds: 0.1, parents: ['bakerWheat', 'brownMold'] },
    ],
    whiteChocoroot: [
        { odds: 0.1, parents: ['chocoroot', 'whiteMildew'] },
    ],
    whiteMildew: [
        { odds: 0.5, parents: ['brownMold', 'whiteMildew'] },
    ],
    brownMold: [
        // { odds: 0.5, parents: ['whiteMildew', 'brownMold'] },
    ],
    meddleweed: [
        // meh
    ],
    whiskerbloom: [
        { odds: 0.01, parents: ['shimmerlily', 'whiteChocoroot'] },
    ],
    chimerose: [
        { odds: 0.05, parents: ['shimmerlily', 'whiskerbloom'] },
        { odds: 0.005, parents: ['chimerose', 'chimerose'] },
    ],
    nursetulip: [
        { odds: 0.05, parents: ['whiskerbloom', 'whiskerbloom'] },
    ],
    drowsyfern: [
        { odds: 0.005, parents: ['chocoroot', 'keenmoss'] },
    ],
    wardlichen: [
        { odds: 0.005, parents: ['cronerice', 'keenmoss'] },
        { odds: 0.005, parents: ['cronerice', 'whiteMildew'] },
        // special case ignored
    ],
    keenmoss: [
        { odds: 0.1, parents: ['greenRot', 'brownMold'] },
    ],
    queenbeet: [
        { odds: 0.01, parents: ['bakeberry', 'chocoroot'] },
    ],
    queenbeetLump: [
        // meh, ignored - 8x Queenbeet (0.1%)
    ],
    duketater: [
        { odds: 0.01, parents: ['queenbeet', 'queenbeet'] },
    ],
    crumbspore: [
        { odds: 0.005, parents: ['doughshroom', 'doughshroom'] },
    ],
    doughshroom: [
        { odds: 0.005, parents: ['crumbspore', 'crumbspore'] },
    ],
    glovemorel: [
        { odds: 0.02, parents: ['crumbspore', 'thumbcorn'] },
    ],
    cheapcap: [
        { odds: 0.04, parents: ['crumbspore', 'shimmerlily'] },
    ],
    foolBolete: [
        { odds: 0.04, parents: ['doughshroom', 'greenRot'] },
    ],
    wrinklegill: [
        { odds: 0.06, parents: ['crumbspore', 'brownMold'] },
    ],
    greenRot: [
        { odds: 0.05, parents: ['whiteMildew', 'clover'] },
    ],
    shriekbulb: [
        // ignore - do not try to plant
        // [0.001, 'wrinklegill', 'elderwort'],
        // ignore 5x Elderword (0.1%)
        // ignore 3x Duketater (0.5%)
        // ignore 4x Doughshroom (0.2%)
    ],
    tidygrass: [
        { odds: 0.02, parents: ['bakeberry', 'whiteChocoroot'] },
    ],
    everdaisy: [
        // ignore 3x Tidygrass, 3x Elderwort (0.2%)
    ],
    ichorpuff: [
        { odds: 0.002, parents: ['elderwort', 'crumbspore'] },
    ],
}
