import options from 'src/options';
import type Automator from '../Automator';

export default abstract class Timer {
    abstract readonly type: 'default' | 'clicker';
    /** Int, # of ticks */
    abstract defaultTimeout: number;
    counter = 0;
    private _timeout = 0;
    get timeout() { return this._timeout; }
    set timeout(val) { this._timeout = Math.floor(val); }

    constructor(protected context: Automator) {}

    abstract execute(): void;

    /** @override add side-effects to the timer that are always run regardless if the timer is started */
    sideEffects(): void {};

    get isRunning() { return this.timeout > 0; }
    get isStopped() { return this.timeout <= 0; }

    startDelay(): number { return 0; }

    get defaultTimeoutMs() { return this.defaultTimeout * options.tickMs; }

    start() {
        this.stop();
        this.counter = 0;
        this.timeout = this.startDelay() || this.defaultTimeout;
    }

    stop() {
        this.timeout = 0;
    }

    run() {
        if (this.isStopped) return console.warn(`Timer ${this.constructor.name} is stopped`);
        this.timeout = this.defaultTimeout;
        this.execute();
        ++this.counter;
    }

    scaleTimeout(value: number) {
        if (this.isStopped) return;
        this.timeout *= value;
    }
}
