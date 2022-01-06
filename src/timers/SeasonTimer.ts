import options, { msToTicks } from 'src/options';
import Timer from 'src/timers/Timer';
import { SeasonKey } from 'src/typeDefs';
import { Game } from 'src/utils';

export default class SeasonTimer extends Timer {
    type = 'default' as const;

    defaultTimeout = msToTicks(20e3);

    startDelay() { return this.defaultTimeout; }

    execute(): void {
        const setSeason = (key: SeasonKey) => {
            const { name, triggerUpgrade } = Game.seasons[key as SeasonKey];
            if (!triggerUpgrade.canBuy()) return false;

            this.context.buy(triggerUpgrade);
            this.context.log('🌞 New season ahoy: ' + name);
            return true;
        }

        const tuples = Object.entries(config)
            .sort((a, b) => a[0].localeCompare(b[0])) as Array<[SeasonKey, SeasonConfig]>;

        for (const [key, { getCount, getTotal }] of tuples) {
            if (options.season.exclude.includes(key)) continue;
            if (getCount() >= getTotal()) continue; // season done
            if (Game.season === key) return; // already current season, nothing to do

            setSeason(key);
            return;

        }

        // when everything is done and we've reverted to the default season, we're done for this ascention
        if (Game.season === options.season.default) return this.stop();

        // if no other season has been set, try to revert to the default season
        setSeason(options.season.default);
    }
}

type SeasonConfig = { getCount: () => number; getTotal: () => number; };

const config: Record<SeasonKey, SeasonConfig> = {
    christmas: {
        getCount: () => Game.GetHowManySantaDrops(),
        getTotal: () => Game.santaDrops.length,
    },
    easter: {
        getCount: () => Game.GetHowManyEggs(),
        getTotal: () => Game.eggDrops.length,
    },
    fools: {
        getCount: () => 0,
        getTotal: () => 0,
    },
    halloween: {
        getCount: () => Game.GetHowManyHalloweenDrops(),
        getTotal: () => Game.halloweenDrops.length,
    },
    valentines: {
        getCount: () => Game.GetHowManyHeartDrops(),
        getTotal: () => Game.heartDrops.length,
    },
};
