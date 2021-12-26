interface Window {
    __automateLog: LogMessage[];
    unsafeWindow?: this;
}

interface LogMessage {
    time: number;
    msg: string;
    count: number;
    color?: string;
    extra?: string;
    eta?: number;
}
