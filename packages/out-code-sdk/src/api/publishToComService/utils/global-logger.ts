// globalLogger.ts
export interface LoggerType {
  info: (message: string) => void;
  error: (message: string) => void;
}

let globalLogger: LoggerType | null = null;

export const setGlobalLogger = (logger: LoggerType) => {
  globalLogger = logger;
};

export const getGlobalLogger = (): LoggerType => {
  if (!globalLogger) {
    throw new Error('Global logger has not been set.');
  }
  return globalLogger;
};