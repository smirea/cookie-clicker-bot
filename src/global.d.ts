interface Window {
    __automateLog: LogMessage[];
    unsafeWindow?: this;
}

interface LogMessage {
    time: number;
    msg: string;
    count: number;
    extra?: string;
}
