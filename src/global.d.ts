interface Window {
    __automateLog: LogMessage[];
    unsafeWindow?: this;
}

interface LogMessage {
    id: number;
    time: number;
    msg: string;
    count: number;
    color?: string;
    extra?: string;
    eta?: number;
}

/** global export from library */
const l: (id: string) => HTMLDivElement | null;
