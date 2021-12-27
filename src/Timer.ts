import type CookieAutomator from './CookieAutomator';

export default abstract class Timer {
    abstract defaultTimeout: number;
    private timeout!: number | 'stop';
    private timeoutRef?: NodeJS.Timeout;
    private startTimeoutRef?: NodeJS.Timeout;

    constructor(protected context: CookieAutomator) {}

    get isRunning() { return this.timeoutRef !== undefined; }

    abstract execute(): void;

    startDelay(): number { return 0; }

    start() {
        this.startTimeoutRef = setTimeout(() => this.run(), this.startDelay());
    }

    stop() {
        clearTimeout(this.timeoutRef!);
        clearTimeout(this.startTimeoutRef!);
        delete this.timeoutRef;
        delete this.startTimeoutRef;
    }

    private run() {
        this.timeout = this.defaultTimeout;
        this.execute();
        if (this.timeout as any === 'stop') return;
        this.timeoutRef = setTimeout(() => { this.run(); }, this.timeout);
    }

    scaleTimeout(value: number) {
        if (this.timeout === 'stop') return;
        this.timeout *= value;
    }

    stopTimeout() { this.timeout = 'stop'; }
}
