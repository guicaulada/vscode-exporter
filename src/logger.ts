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

  private getTime() {
    const date = new Date();
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const HH = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return `${MM}-${dd}|${HH}:${mm}:${ss}`;
  }

  public getLevel(): LogLevel {
    return this.level;
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public log(level: LogLevel, msg: string, ...keyvals: any[]): void {
    if (level >= this.level) {
      msg = `[VSCode Exporter] [${LogLevel[level]}] [${this.getTime()}] ${msg}`;
      for (let i = 0; i < keyvals.length; i += 2) {
        msg += ` ${keyvals[i]}=${keyvals[i + 1]}`;
      }
      console.log(msg);
    }
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
