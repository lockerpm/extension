import { LogLevelType } from '../enums/logLevelType';

import { LogService as LogServiceAbstraction } from '../abstractions/log.service';

// import hrtime from 'browser-hrtime';

export class ConsoleLogService implements LogServiceAbstraction {
  protected timersMap: Map<string, [number, number]> = new Map();

  constructor(protected isDev: boolean, protected filter: (level: LogLevelType) => boolean = null) { }

  debug(message: string) {
    if (!this.isDev) {
      return;
    }
    this.write(LogLevelType.Debug, message);
  }

  info(message: string) {
    this.write(LogLevelType.Info, message);
  }

  warning(message: string) {
    this.write(LogLevelType.Warning, message);
  }

  error(message: string) {
    this.write(LogLevelType.Error, message);
  }

  write(level: LogLevelType, message: string) {
    if (this.filter != null && this.filter(level)) {
      return;
    }

    switch (level) {
      case LogLevelType.Debug:
        break;
      case LogLevelType.Info:
        break;
      case LogLevelType.Warning:
        break;
      case LogLevelType.Error:
        break;
      default:
        break;
    }
  }

  time(label: string = 'default') {
    if (!this.timersMap.has(label)) {
      // this.timersMap.set(label, hrtime());
    }
  }

  timeEnd(label: string = 'default'): [number, number] {
    // const elapsed = hrtime(this.timersMap.get(label));
    // this.timersMap.delete(label);
    // this.write(LogLevelType.Info, `${label}: ${elapsed[0] * 1000 + elapsed[1] / 10e6}ms`);
    // return elapsed;
    return [0, 0]
  }
}
