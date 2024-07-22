export interface LoggerType {
    info: (message: string) => void;
    error: (message: string) => void;
}
export declare const setGlobalLogger: (logger: LoggerType) => void;
export declare const getGlobalLogger: () => LoggerType;
