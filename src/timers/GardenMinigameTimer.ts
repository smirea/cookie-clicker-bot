import { clamp, Game } from 'src/utils';
import Timer from 'src/timers/Timer';
import { Garden, Options } from 'src/typeDefs';
import options from 'src/options';

export default class GardenMinigameTimer extends Timer {
    type = 'default' as const;

    defaultTimeout = 1000;

    startDelay() { return this.defaultTimeout; }

    strategy!: Options['garden']['strategies'][number];

    execute(): void {
        const garden = this.garden;
        if (!garden) return this.scaleTimeout(10); // git gud first

        this.setStrategy();
        this.setSoil();

        const lvl = Math.min(Game.Objects.Farm.level - 1, garden.plotLimits.length);
        const [x1, y1, x2, y2] = garden.plotLimits[lvl];
        const totalPlots = (x2 - x1) * (y2 - y1);
        const emptyPlots: Coordinate[] = [];
        const usedPlots: Array<Coordinate & { age: number; plant: Garden.Plant }> = [];

        for (let x = x1; x < x2; ++x) {
            for (let y = y1; y < y2; ++y) {
                const tile = garden.getTile(x, y);
                const [plantId, age] = tile;

                if (!plantId) {
                    emptyPlots.push({ x, y });
                    continue;
                }

                const plant = garden.plantsById[plantId - 1];

                // send really old plants to a farm upstate
                if (age >= plant.mature &&
                    (plant.weed || this.getDecayTicks(x, y) <= this.strategy.harvestDecayTicks)
                ) {
                    if (garden.harvest(x, y)) {
                        this.context.log(`🥀 Harvested ${plant.name} at [${x - x1}, ${y - y1}]`);
                        emptyPlots.push({ x, y });
                        continue;
                    }
                }

                usedPlots.push({ x, y, plant, age });
            }
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
        garden.seedSelected = toPlant.id;
        garden.clickTile(x, y);
        this.context.log(`🌷 Planted ${toPlant.name} at [${x - x1}, ${y - y1}]: ${toPlant.effsStr}`);
    }

    get garden() { return Game.Objects.Farm.minigame; }

    setStrategy() {
        const garden = this.garden!;
        const seeds = garden.plantsById.filter(p => p.unlocked).length;
        const active = options.garden.strategies.filter(s => seeds >= s.conditions.minSeeds);
        const nextStrategy = active[active.length - 1] || active[0];

        if (this.strategy !== nextStrategy) {
            this.context.log('🏡 Garden strategy: ' + nextStrategy.name);
        }

        this.strategy = nextStrategy;
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

// const MUTATION_LAYOURS = {
//     singleType: parseLayouts(`
//         1 0
//         1 0

//         0 1 0
//         0 1 0

//         0 0 0
//         1 1 1
//         0 0 0

//         0 0 0 0
//         1 1 1 1
//         0 0 0 0

//         1 0 0 1
//         0 0 1 0
//         0 1 0 0
//         1 0 0 1

//         1 0 0 0 1
//         0 1 0 1 0
//         0 0 0 0 0
//         1 0 1 0 1
//     `),
// } as const;
