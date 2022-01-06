import options from 'src/options';
import type Automator from '../Automator';

export default abstract class Timer {
    abstract readonly type: 'default' | 'clicker';
    /** Int, # of ticks */
    abstract defaultTimeout: number;
    timeout = 0;
    counter = 0;

    constructor(protected context: Automator) {}

    abstract execute(): void;

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
