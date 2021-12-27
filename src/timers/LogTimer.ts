import Timer from 'src/Timer';
import options from 'src/options';
import packageJson from '../../package.json';
import { formatAmount, formatDuration } from 'src/utils';

export default class LogTimer extends Timer {
    defaultTimeout = 1e3;

    // wait for random states to be initialized
    startDelay() { return 100; }

    execute(): void {
        this.printLog();

        // save log to localStorage
        if (Math.floor(Date.now() / 1000) % 3 === 0) {
            localStorage[options.localStorage.log] = JSON.stringify(
                this.context.logMessages.slice(-100)
            );
        }
    }

    printLog() {
        const { logMessages, upgradeFatigue, realCps, lastState: { buildings } } = this.context;

        console.clear();
        console.log('%c%s v%s', 'color:gray', packageJson.name, packageJson.version);
        console.log(
            `upgradeFatigue: %s | realCps: %s`,
            upgradeFatigue ? Math.round(upgradeFatigue * 100) / 100 + 'x' : 'disabled',
            formatAmount(realCps)
        );
        console.log('%cBuy Order:', 'font-weight:bold');
        for (const obj of buildings.sorted) {
            console.log('   - %s: %sx', obj.name, obj.relativeValue);
        }
        // console.log('%cLast %d log messages (window.__automateLog):', 'font-weight:bold', options.showLogs);
        for (const { time, msg, count, eta, extra, color = 'white' } of logMessages.slice(-1 * options.showLogs)) {
            console.log(
                `%c%s%c %s %c%s`,
                'color:gray',
                new Date(time).toISOString().slice(11, 19),
                `color:${color}`,
                msg,
                'color:gray',
                [
                    count > 1 ? `✕ ${count}` : '',
                    extra,
                    eta ? 'ETA: ' + formatDuration(eta) : '',
                ].filter(x => x).join(' | ')
            );
        }
    }
}
