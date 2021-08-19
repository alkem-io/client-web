import winston from 'winston';
import { TransformableInfo } from 'logform';
import TransportStream from 'winston-transport';

// enumeration to assign color values to
enum LevelColors {
  INFO = 'darkturquoise',
  WARN = 'khaki',
  ERROR = 'tomato',
}

// type levels used for setting color and shutting typescript up
type Levels = 'INFO' | 'WARN' | 'ERROR';

const defaultColor = 'color: inherit';

//! Overriding winston console transporter
class Console extends TransportStream {
  constructor(options = {}) {
    super(options);

    this.setMaxListeners(30);
  }

  log(info: TransformableInfo, next: () => void) {
    // styles a console log statement accordingly to the log level
    // log level colors are taken from levelcolors enum
    console.log(
      `%c[%c${info.level.toUpperCase()}%c]:`,
      defaultColor,
      `color: ${LevelColors[info.level.toUpperCase() as Levels]};`,
      defaultColor,
      // message will be included after stylings
      // through this objects and arrays will be expandable
      info.message
    );

    // must call the next function here
    // or otherwise you'll only be able to send one message
    next();
  }
}

// Synchronizing the logic on the server where console logging is based on env variable setting
// LOGGING_CONSOLE_ENABLED is used, same as in Alkemio Server
export const logger = winston.createLogger({
  transports: [
    new Console({
      silent: process.env.REACT_APP_LOGGING_CONSOLE_ENABLED === 'false' ?? true,
      level: 'info',
    }),
  ],
});
