import Timer from 'src/timers/Timer';
import options from 'src/options';
import packageJson from '../../package.json';
import { formatAmount, formatDuration } from 'src/utils';

export default class LogTimer extends Timer {
    type = 'default' as const;

    defaultTimeout = 100;

    private lastMessage?: LogMessage;

    // wait for random states to be initialized
    startDelay() { return this.defaultTimeout; }

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
        const last = logMessages[logMessages.length - 1];

        const printLogLine = (line: LogMessage) => {
            const { time, msg, count, eta, extra, color = 'white' } = line;
            this.lastMessage = { ...line };

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

        if (last && this.lastMessage && this.counter % 15 !== 0) {
            // only print last log messages
            const isDifferentMessage = last.id !== this.lastMessage.id;
            const isDifferentMeta = (
                last.count !== this.lastMessage.count ||
                last.eta !== this.lastMessage.eta ||
                last.extra !== this.lastMessage.extra
            );
            if (isDifferentMessage || isDifferentMeta) {
                const index = logMessages.findIndex(x => x.id != null && x.id === this.lastMessage!.id);
                if (index > -1) {
                    for (const line of logMessages.slice(index + (isDifferentMessage ? 1 : 0))) printLogLine(line);
                }
            }
        } else { // clear and print everything
            console.clear();
            console.log('%c%s v%s', 'color:gray', packageJson.name, packageJson.version);
            console.log(
                `upgradeFatigue: %s | realCps: %s`,
                upgradeFatigue ? Math.round(upgradeFatigue * 100) / 100 + 'x' : 'disabled',
                formatAmount(realCps)
            );
            console.log('%cBuy Order:', 'font-weight:bold');
            for (const obj of buildings) {
                console.log('   - %s: %sx', obj.name, obj.relativeValue);
            }
            for (const line of logMessages.slice(-1 * options.showLogs)) printLogLine(line);
        }
    }
}
