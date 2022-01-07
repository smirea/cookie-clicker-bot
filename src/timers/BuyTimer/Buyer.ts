import type Automator from 'src/Automator';
import { Game } from 'src/utils';

/**
 *
 */
export default abstract class Buyer {
    abstract scale(x: number): number;

    constructor(protected context: Automator) {}

    protected abstract getOrders(): GetOrdersResult;

    execute(): Array<BuyOrder<{ score: number }>> {
        const result = this.getOrders();
        if (!result) return [];

        const list: Array<BuyOrder<{ score: number }>> = [];

        for (const { ratio, ...item } of Array.isArray(result) ? result : [result]) {
            const score = Math.round(1e3 * Math.log10(this.scale(ratio)));
            list.push({ ...item, score });
        }

        return list;
    }

    getEta (targetCookies: number) {
        if (targetCookies <= Game.cookies) return undefined;
        return (targetCookies - Game.cookies) / this.context.realCps;
    }
}

type BuyOrder<T extends Record<string, any>> = (
    T &
    { cookies: number; log?: () => Omit<LogMessage, 'id' | 'count' | 'time'>; } &
    (
        | { type: 'wait'; buy?: () => void }
        | { type: 'buy'; buy: () => void; }
    )
);

export type GetOrdersResult = null | BuyOrder<{ ratio: number }> | Array<BuyOrder<{ ratio: number }>>;

export const scales = {
    x2: (x: number) => x ** 2,
} as const;
