// The loglevel-backed shape behind matrix-js-sdk's exported root logger; its
// public Logger type does not expose these.
type SdkRootLogger = {
  methodFactory: (methodName: string, level: number, loggerName: string | symbol) => (...msg: unknown[]) => void;
  rebuild(): void;
};

const SILENCED_LOG_METHODS = new Set(['debug', 'info']);
const discard = (): void => {};

let quieted: Promise<void> | undefined;

// The SDK resets every logger it creates to DEBUG, so a level cannot keep its
// per-request and per-sync chatter out of the console. Each logger copies the
// root's methodFactory when it is created, so the root's factory is swapped
// before the SDK itself loads: loggers its modules create at load time, and the
// per-room ones made after the client starts, then drop debug and info while
// warnings and errors still reach the console.
const quietSdkLogging = (): Promise<void> => {
  quieted ??= import('matrix-js-sdk/lib/logger').then(({ logger }) => {
    const root = logger as unknown as SdkRootLogger;
    const consoleFactory = root.methodFactory;
    root.methodFactory = (methodName, level, loggerName) =>
      SILENCED_LOG_METHODS.has(methodName) ? discard : consoleFactory(methodName, level, loggerName);
    root.rebuild();
  });
  return quieted;
};

export { quietSdkLogging };
