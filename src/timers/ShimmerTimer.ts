import { $ } from 'src/utils';
import Timer from 'src/Timer';

export default class ShimmerTimer extends Timer {
    defaultTimeout = 3e3;

    execute(): void {
        $('.shimmer')?.click();
    }
}
