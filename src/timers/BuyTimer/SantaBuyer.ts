import { fixMenuBug, Game } from 'src/utils';
import Buyer, { GetOrdersResult } from './Buyer';

export default class SantaBuyer extends Buyer {
    scale(x: number) { return x ** 2; }

    getOrders(): GetOrdersResult {
        if (!Game.Upgrades['A festive hat'].bought) return null;
        if (Game.cookiesPs < 1e3) return null;
        if (Game.santaLevel >= Game.santaLevels.length - 1) return null;

        const price = Math.pow(Game.santaLevel + 1, Game.santaLevel + 1);

        const base = {
            ratio: Game.cookies / (price * 4),
            cookies: price,
        };

        if (base.ratio >= 1) {
            return {
                type: 'buy',
                ...base,
                buy: () =>
                    this.context.buy({
                        buy: () => {
                            Game.UpgradeSanta();
                            fixMenuBug();
                        },
                    }),
                log: () => ({ msg: '🎅 Ho Ho Ho!', color: 'crimson' }),
            };
        }

        if (base.ratio >= 0.75) {
            return {
                type: 'wait',
                ...base,
                log: () => ({
                    msg: `🎅 'Twas the night before X-MAS!`,
                    eta: this.getEta(price),
                }),
            };
        }

        return null;
    }
}
