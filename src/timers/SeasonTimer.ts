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
            if (Game.season === key) return true;

            const { name, triggerUpgrade } = Game.seasons[key];
            if (!triggerUpgrade.canBuy()) return false;

            this.context.buy(triggerUpgrade);
            this.context.log('🌞 New season ahoy: ' + name);
            return true;
        }

        if (Game.season) { // there's still work to be done on the current season
            const season = config[Game.season];
            if (season.getCount() < season.getTotal()) return;
        }

        const available = Object.values(config)
            .filter(s => !options.season.exclude.includes(s.key))
            .filter(s => s.getCount() < s.getTotal())
            .sort((a, b) => a.key.localeCompare(b.key));

        if (available.length) {
            setSeason(available[0].key);
        } else if (setSeason(options.season.default)) {
            this.stop();
        }
    }
}

type SeasonConfig = { getCount: () => number; getTotal: () => number; };

const config: { [Key in SeasonKey]: SeasonConfig & { key: Key } } = {
    christmas: {
        key: 'christmas',
        getCount: () => Game.GetHowManySantaDrops(),
        getTotal: () => Game.santaDrops.length,
    },
    easter: {
        key: 'easter',
        getCount: () => Game.GetHowManyEggs(),
        getTotal: () => Game.easterEggs.length,
    },
    fools: {
        key: 'fools',
        getCount: () => 0,
        getTotal: () => 0,
    },
    halloween: {
        key: 'halloween',
        getCount: () => Game.GetHowManyHalloweenDrops(),
        getTotal: () => Game.halloweenDrops.length,
    },
    valentines: {
        key: 'valentines',
        getCount: () => Game.GetHowManyHeartDrops(),
        getTotal: () => Game.heartDrops.length,
    },
};
