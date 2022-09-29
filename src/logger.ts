import { Utils } from './utils';

export enum LogLevel {
  DEBUG = 0,
  INFO,
  WARN,
  ERROR,
}

export class Logger {
  private level: LogLevel = LogLevel.INFO;

  constructor(level?: LogLevel) {
    if (level !== undefined) {
      this.setLevel(level);
    }
  }

  private log(level: LogLevel, msg: string, ...keyvals: any[]): void {
    if (level >= this.level) {
      msg = `[VSCode Exporter] [${LogLevel[level]}] [${Utils.getTime()}] ${msg}`;
      for (let i = 0; i < keyvals.length; i += 2) {
        msg += ` ${keyvals[i]}=${keyvals[i + 1]}`;
      }
      console.log(msg);
    }
  }

  public getLevel(): LogLevel {
    return this.level;
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public debug(msg: string, ...keyvals: any[]): void {
    this.log(LogLevel.DEBUG, msg, ...keyvals);
  }

  public info(msg: string, ...keyvals: any[]): void {
    this.log(LogLevel.INFO, msg, ...keyvals);
  }

  public warn(msg: string, ...keyvals: any[]): void {
    this.log(LogLevel.WARN, msg, ...keyvals);
  }

  public error(msg: string, ...keyvals: any[]): void {
    this.log(LogLevel.ERROR, msg, ...keyvals);
  }
}
