import Timer from 'src/Timer';
import options from 'src/options';

export default class LogTimer extends Timer {
    execute() {
        localStorage[options.localStorage.log] = JSON.stringify(
            this.context.logMessages.slice(-100)
        );
        return 2e3;
    }
}
