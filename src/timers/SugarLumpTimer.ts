import { Game } from 'src/utils';
import Timer from 'src/Timer';

export default class SugarLumpTimer extends Timer {
    execute() {
        if ((Date.now() - Game.lumpT) / 3600e3 >= 23.1) Game.clickLump();
        return 30 * 3600e3;
    }
}
