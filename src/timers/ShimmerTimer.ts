import { Game } from 'src/utils';
import Timer from 'src/timers/Timer';
import { msToTicks } from 'src/options';

export default class ShimmerTimer extends Timer {
    type = 'clicker' as const;

    defaultTimeout = msToTicks(800);

    execute(): void {
        if (!Game.shimmers.length) return;

        const first = Game.shimmers[0];

        if (Game.shimmers.length > 2) {
            Game.shimmers[0].l.click();
            if (Game.shimmers.length > 10) this.scaleTimeout(0.05);
            else this.scaleTimeout(0.2);
        } else if (!Game.Achievements['Fading luck'].won) {
            if (first.type === 'golden') {
                if (first.life <= 100) first.l.click();
            } else first.l.click();
        } else first.l.click();
    }
}
