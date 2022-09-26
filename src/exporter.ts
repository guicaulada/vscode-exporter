import * as vscode from 'vscode';
import * as prom from 'prom-client';
import * as http from 'http';
import * as path from 'path';
import * as metrics from './metrics';
import { Logger, LogLevel } from './logger';

export class VSCodeExporter {
  private id: string = 'vscode-exporter';

  private port: number = 9910;
  private debug: boolean = false;
  private untitled: boolean = false;
  private timeout: number = 60;
  private interval: number = 15;

  private logger: Logger;
  private config: vscode.WorkspaceConfiguration;
  private disposable?: vscode.Disposable;
  private server?: http.Server;

  private isCompiling: boolean = false;
  private isDebugging: boolean = false;
  private isIdle: boolean = false;

  private lastFile: string = '';
  private lastHeartbeat: number = 0;
  private lastLineCount: number = 0;
  private lastDebug: boolean = false;
  private lastCompile: boolean = false;
  private lastLanguage: string = '';
  private lastUntitled: boolean = false;
  private lastIdle: boolean = false;

  private idleTimeout?: NodeJS.Timeout;

  constructor(logger: Logger) {
    this.logger = logger;
    this.config = vscode.workspace.getConfiguration(this.id);
  }

  public initialize(): void {
    this.logger.info('initializing');
    this.port = this.config.get('port', this.port);
    this.debug = this.config.get('debug', this.debug);
    this.untitled = this.config.get('untitled', this.debug);
    this.timeout = this.config.get('timeout', this.timeout);
    this.interval = this.config.get('min-interval', this.interval);
    if (this.debug) {
      this.logger.setLevel(LogLevel.DEBUG);
    }
    prom.collectDefaultMetrics();
    this.setupEventListeners();
    this.server = http
      .createServer(async (req, res) => {
        this.logger.debug('request received', 'url', req.url, 'method', req.method, 'address', req.socket.remoteAddress);
        if (req.url?.endsWith('/metrics')) {
          res.setHeader('Content-Type', prom.register.contentType);
          res.writeHead(200);
          return res.end(await prom.register.metrics());
        }
        res.setHeader('Location', '/metrics');
        res.writeHead(302);
        return res.end();
      })
      .listen(this.port, () => {
        this.logger.info('listening', 'port', this.port);
      });
  }

  public dispose() {
    this.logger.info('disposing');
    this.disposable?.dispose();
    this.server?.close();
  }

  public openMetrics(): void {
    let url = `http://localhost:${this.port}/metrics`;
    vscode.env.openExternal(vscode.Uri.parse(url));
  }

  private setupEventListeners(): void {
    let subscriptions: vscode.Disposable[] = [];

    vscode.window.onDidChangeTextEditorSelection(this.onChange, this, subscriptions);
    vscode.window.onDidChangeActiveTextEditor(this.onChange, this, subscriptions);
    vscode.workspace.onDidSaveTextDocument(this.onSave, this, subscriptions);

    vscode.tasks.onDidStartTask(this.onDidStartTask, this, subscriptions);
    vscode.tasks.onDidEndTask(this.onDidEndTask, this, subscriptions);

    vscode.debug.onDidChangeActiveDebugSession(this.onDebuggingChanged, this, subscriptions);
    vscode.debug.onDidChangeBreakpoints(this.onDebuggingChanged, this, subscriptions);
    vscode.debug.onDidStartDebugSession(this.onDidStartDebugSession, this, subscriptions);
    vscode.debug.onDidTerminateDebugSession(this.onDidTerminateDebugSession, this, subscriptions);

    this.disposable = vscode.Disposable.from(...subscriptions);
  }

  private onDebuggingChanged(): void {
    this.onEvent(false);
  }

  private onDidStartDebugSession(): void {
    this.isDebugging = true;
    this.onEvent(false);
  }

  private onDidTerminateDebugSession(): void {
    this.isDebugging = false;
    this.onEvent(false);
  }

  private onDidStartTask(): void {
    this.isCompiling = true;
    this.onEvent(false);
  }

  private onDidEndTask(): void {
    this.isCompiling = false;
    this.onEvent(false);
  }

  private onChange(): void {
    this.onEvent(false);
  }

  private onSave(): void {
    this.onEvent(true);
  }

  private onEvent(isWrite: boolean): void {
    let editor = vscode.window.activeTextEditor;
    if (editor) {
      let doc = editor.document;
      if (doc) {
        let file: string = doc.fileName;
        if (file) {
          let time: number = Date.now();
          if (
            isWrite ||
            this.isIdle ||
            this.enoughTimePassed(time) ||
            this.lastFile !== file ||
            this.lastDebug !== this.isDebugging ||
            this.lastCompile !== this.isCompiling
          ) {
            this.isIdle = false;
            this.registerMetrics(file, time, doc.lineCount, doc.languageId, isWrite, this.isCompiling, this.isDebugging, doc.isUntitled);
            this.lastIdle = false;
          }
        }
      }
    }
  }

  private registerIdleMetrics(): void {
    this.isIdle = true;
    this.registerMetrics(this.lastFile, Date.now(), this.lastLineCount, this.lastLanguage, false, this.lastCompile, this.lastDebug, this.lastUntitled);
    this.lastIdle = true;
  }

  private registerMetrics(
    file: string,
    time: number,
    lineCount: number,
    language: string,
    isWrite: boolean,
    isCompiling: boolean,
    isDebugging: boolean,
    isUntitled: boolean,
  ): void {
    // prettier-ignore
    this.logger.debug('registering metrics', 'file', file, 'time', time, 'lineCount', lineCount, 'language', language, 'isWrite', isWrite, 'isCompiling', isCompiling, 'isDebugging', isDebugging, 'isUntitled', isUntitled, "isIdle", this.isIdle, 'lastFile', this.lastFile, 'lastHeartbeat', this.lastHeartbeat, 'lastLineCount', this.lastLineCount, 'lastLanguage', this.lastLanguage, 'lastCompile', this.lastCompile, 'lastDebug', this.lastDebug, 'lastUntitled', this.lastUntitled, "lastIdle", this.lastIdle);
    const timeElapsed = Math.floor((time - this.lastHeartbeat) / 1000);
    if (file !== '' || this.lastFile !== '') {
      if (!isUntitled || this.untitled) {
        if (file === this.lastFile) {
          this.registerMetricsForCurrentFile(file, language, lineCount, isDebugging, isCompiling, timeElapsed);
        } else if (this.lastFile !== '') {
          this.registerMetricsForLastFile(timeElapsed);
        }
      }
    }
    this.updateLastValues(file, time, lineCount, language, isCompiling, isDebugging, isUntitled);
  }

  private updateLastValues(file: string, time: number, lineCount: number, language: string, isCompiling: boolean, isDebugging: boolean, isUntitled: boolean) {
    clearTimeout(this.idleTimeout);
    this.lastFile = file;
    this.lastHeartbeat = time;
    this.lastCompile = isCompiling;
    this.lastDebug = isDebugging;
    this.lastLineCount = lineCount;
    this.lastLanguage = language;
    this.lastUntitled = isUntitled;
    const timeout = this.isIdle ? this.interval : this.timeout;
    this.idleTimeout = setTimeout(() => {
      this.registerIdleMetrics();
    }, timeout * 1000);
  }

  private registerMetricsForCurrentFile(
    file: string,
    language: string,
    lineCount: number,
    isDebugging: boolean,
    isCompiling: boolean,
    timeElapsed: number,
  ): void {
    const fileLabels = this.getFileLabels(file);
    const labels = { ...fileLabels, language };
    metrics.lineCount.set(labels, lineCount);

    if (this.isIdle || this.lastIdle) {
      metrics.timeSpentIdle.inc(labels, timeElapsed);
    } else {
      metrics.timeSpentEditing.inc(labels, timeElapsed);
    }

    if (isDebugging) {
      metrics.timeSpentDebugging.inc(labels, timeElapsed);
    }
    if (isCompiling) {
      metrics.timeSpentCompiling.inc(labels, timeElapsed);
    }
  }

  private registerMetricsForLastFile(timeElapsed: number): void {
    const fileLabels = this.getFileLabels(this.lastFile);
    const labels = { ...fileLabels, language: this.lastLanguage };
    if (this.isIdle || this.lastIdle) {
      metrics.timeSpentIdle.inc(labels, timeElapsed);
    } else {
      metrics.timeSpentEditing.inc(labels, timeElapsed);
    }
    if (this.lastDebug) {
      metrics.timeSpentDebugging.inc(labels, timeElapsed);
    }
    if (this.lastCompile) {
      metrics.timeSpentCompiling.inc(labels, timeElapsed);
    }
  }

  private enoughTimePassed(time: number): boolean {
    return this.lastHeartbeat + this.interval * 1000 < time;
  }

  private getFileLabels(file: string) {
    const project = this.getProjectName(file);
    const folder = this.getFileFolder(file);
    const fileName = this.getFileName(file);
    const extension = this.getFileExtension(file);
    this.logger.debug('calculated labels', 'project', project, 'folder', folder, 'fileName', fileName, 'extension', extension);
    return { project, folder, file: fileName, extension };
  }

  private getFileExtension(file: string): string {
    return path.extname(file);
  }

  private getFileName(file: string): string {
    return path.basename(file);
  }

  private getFileFolder(file: string): string {
    const projectPath = this.getProjectFolder(file);
    return path.dirname(file).replace(projectPath, '').substring(1);
  }

  private getProjectName(file: string): string {
    if (!vscode.workspace) return '';
    let uri = vscode.Uri.file(file);
    let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder) {
      try {
        return workspaceFolder.name;
      } catch (e) {}
    }
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length) {
      return vscode.workspace.workspaceFolders[0].name;
    }
    return vscode.workspace.name || '';
  }

  private getProjectFolder(file: string): string {
    if (!vscode.workspace) return '';
    let uri = vscode.Uri.file(file);
    let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder) {
      try {
        return workspaceFolder.uri.fsPath;
      } catch (e) {}
    }
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length) {
      return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return '';
  }
}
