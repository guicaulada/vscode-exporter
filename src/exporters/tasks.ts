import * as vscode from 'vscode';
import { Logger } from '../logger';
import * as metrics from '../metrics';
import { State } from '../state';
import { Utils } from '../utils';

export class TaskExporter {
  private logger: Logger;
  private state: State;

  constructor(logger: Logger, state: State) {
    this.logger = logger;
    this.state = state;
  }

  public setupEventListeners(): vscode.Disposable {
    this.logger.debug('setting up task event listeners');
    let subscriptions: vscode.Disposable[] = [];

    vscode.tasks.onDidEndTask(this.onDidEndTask, this, subscriptions);
    vscode.tasks.onDidEndTaskProcess(this.onDidEndTaskProcess, this, subscriptions);
    vscode.tasks.onDidStartTask(this.onDidStartTask, this, subscriptions);
    vscode.tasks.onDidStartTaskProcess(this.onDidStartTaskProcess, this, subscriptions);

    return vscode.Disposable.from(...subscriptions);
  }

  private onDidEndTask(event: vscode.TaskEndEvent) {
    this.logger.debug('received event onDidEndTask');
    const name = event.execution.task.name;
    const task = this.state.tasks.get(name);
    if (task) {
      const time = Utils.getTimeSince(task.start);
      const labels = this.state.getTaskLabels(task);
      metrics.tasks.tasksActive.dec(labels, 1);
      metrics.tasks.secondsTotal.inc(labels, time);
      this.state.tasks.delete(name);
    }
  }

  private onDidEndTaskProcess(event: vscode.TaskProcessEndEvent) {
    this.logger.debug('received event onDidEndTaskProcess');
    const name = event.execution.task.name;
    const task = this.state.tasks.get(name);
    if (task) {
      const labels = this.state.getTaskLabels(task);
      metrics.tasks.processTotal.inc({ ...labels, exit_code: event.exitCode }, 1);
      metrics.tasks.processActive.dec(labels, 1);
    }
  }

  private onDidStartTask(event: vscode.TaskStartEvent) {
    this.logger.debug('received event onDidStartTask');
    const task = this.state.fromTask(event.execution.task);
    this.state.tasks.set(task.name, task);
    const labels = this.state.getTaskLabels(task);
    metrics.tasks.tasksActive.inc(labels, 1);
  }

  private onDidStartTaskProcess(event: vscode.TaskProcessStartEvent) {
    this.logger.debug('received event onDidStartTaskProcess');
    const task = this.state.tasks.get(event.execution.task.name);
    if (task) {
      const labels = this.state.getTaskLabels(task);
      metrics.tasks.processActive.inc(labels, 1);
    }
  }
}
