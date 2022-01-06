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

        for (const [key, { getCount, getTotal }] of Object.entries(config)) {
            if (options.season.exclude.includes(key as SeasonKey)) continue;
            if (getCount() >= getTotal()) continue; // season done
            if (Game.season === key) continue; // already current season
            if (setSeason(key as SeasonKey)) return;
        }

        // when everything is done and we've reverted to the default season, we're done for this ascention
        if (Game.season === options.season.default) return this.stop();

        // if no other season has been set, try to revert to the default season
        setSeason(options.season.default);
    }
}

const config: Record<
    SeasonKey,
    { getCount: () => number; getTotal: () => number; }
> = {
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
