import { Game } from 'src/utils';
import Timer from 'src/Timer';

export default class SugarLumpTimer extends Timer {
    defaultTimeout = 0.5 * 3600e3;

    execute(): void {
        if ((Date.now() - Game.lumpT) / 3600e3 >= 23.1) Game.clickLump();
    }
}
