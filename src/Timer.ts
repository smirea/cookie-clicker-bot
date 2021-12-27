import type CookieAutomator from './CookieAutomator';

export default abstract class Timer {
    timeout?: NodeJS.Timeout;

    constructor(protected context: CookieAutomator) {}

    get isRunning() { return this.timeout !== undefined; }

    abstract execute(): number | 'stop';

    startDelay(): number { return 0; }

    start() { this.run(); }

    stop() {
        clearTimeout(this.timeout!);
        delete this.timeout;
    }

    private run() {
        const nextTimeout = this.execute();
        if (nextTimeout === 'stop') return;
        this.timeout = setTimeout(() => { this.run(); }, nextTimeout);
    }
}
