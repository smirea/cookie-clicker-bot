import { $ } from 'src/utils';
import Timer from 'src/Timer';

export default class ShimmerTimer extends Timer {
    execute() {
        $('.shimmer')?.click();
        return 3000;
    }
}
