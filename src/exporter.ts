import * as vscode from 'vscode';
import * as prom from 'prom-client';
import * as http from 'http';
import { Logger, LogLevel } from './logger';
import { DebugExporter, TaskExporter, WindowExporter, WorkspaceExporter } from './exporters';
import { State } from './state';

export class VSCodeExporter {
  public id: string = 'vscode-exporter';
  private configId: string = 'VSCodeExporter';

  private port: number = 9931;
  private debug: boolean = false;

  private state: State;
  private logger: Logger;
  private config: vscode.WorkspaceConfiguration;
  private disposable?: vscode.Disposable;
  private server?: http.Server;
  private output?: vscode.OutputChannel;

  constructor(logger: Logger) {
    this.logger = logger;
    this.state = new State(logger);
    this.config = vscode.workspace.getConfiguration(this.configId);
    this.port = this.config.get('port', this.port);
    this.debug = this.config.get('debugLogs', this.debug);
    this.output = vscode.window.createOutputChannel(this.id);
  }

  public async initialize(): Promise<void> {
    this.logger.info('initializing exporter');
    if (this.debug) {
      this.logger.setLevel(LogLevel.DEBUG);
    }
    prom.collectDefaultMetrics();
    this.setupDebugEventListeners();
    this.setupServer();
  }

  public dispose() {
    this.logger.info('closing exporter');
    this.disposable?.dispose();
    this.server?.close();
  }

  public async openMetrics(): Promise<void> {
    this.output?.show(true);
    this.output?.replace(await prom.register.metrics());
  }

  private setupDebugEventListeners(): void {
    this.logger.info('setting up event listeners');
    let subscriptions: vscode.Disposable[] = [];

    const debugExporter = new DebugExporter(this.logger, this.state);
    const taskExporter = new TaskExporter(this.logger, this.state);
    const windowExporter = new WindowExporter(this.logger, this.state);
    const workspaceExporter = new WorkspaceExporter(this.logger, this.state);

    subscriptions.push(debugExporter.setupEventListeners());
    subscriptions.push(taskExporter.setupEventListeners());
    subscriptions.push(windowExporter.setupEventListeners());
    subscriptions.push(workspaceExporter.setupEventListeners());

    this.disposable = vscode.Disposable.from(...subscriptions);
  }

  private async requestHandler(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>) {
    this.logger.debug('received request', 'url', req.url, 'method', req.method, 'address', req.socket.remoteAddress);
    if (req.url?.endsWith('/metrics')) {
      res.setHeader('Content-Type', prom.register.contentType);
      res.writeHead(200);
      return res.end(await prom.register.metrics());
    }
    res.setHeader('Location', '/metrics');
    res.writeHead(302);
    return res.end();
  }

  private setupServer(): void {
    vscode.window.onDidChangeWindowState((e) => {
      if (e.focused) {
        this.server = http.createServer(this.requestHandler.bind(this));
        this.server.on('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            this.logger.info('failed to start server retrying...');
            this.server?.close();
            setTimeout(() => this.server?.listen(this.port), 1000);
          }
        });
        this.server.listen(this.port, () => {
          this.logger.info('server listening', 'port', this.port);
        });
      } else if (this.server && this.server.listening) {
        this.server.close(() => {
          this.logger.info('window unfocused, server stopped');
        });
      }
    });
  }
}
