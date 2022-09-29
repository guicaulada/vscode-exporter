import * as vscode from 'vscode';
import { Logger } from '../logger';
import * as metrics from '../metrics';
import { State } from '../state';
import { Utils } from '../utils';

export class DebugExporter {
  private logger: Logger;
  private state: State;

  constructor(logger: Logger, state: State) {
    this.logger = logger;
    this.state = state;
  }

  public setupEventListeners(): vscode.Disposable {
    this.logger.debug('setting up debug event listeners');
    let subscriptions: vscode.Disposable[] = [];

    vscode.debug.onDidChangeActiveDebugSession(this.onDidChangeActiveDebugSession, this, subscriptions);
    vscode.debug.onDidChangeBreakpoints(this.onDidChangeBreakpoints, this, subscriptions);
    vscode.debug.onDidReceiveDebugSessionCustomEvent(this.onDidReceiveDebugSessionCustomEvent, this, subscriptions);
    vscode.debug.onDidStartDebugSession(this.onDidStartDebugSession, this, subscriptions);
    vscode.debug.onDidTerminateDebugSession(this.onDidTerminateDebugSession, this, subscriptions);

    return vscode.Disposable.from(...subscriptions);
  }

  private onDidChangeActiveDebugSession(event?: vscode.DebugSession) {
    this.logger.debug('received event onDidChangeActiveDebugSession');
    if (this.state.activeDebugSession) {
      const time = Utils.getTimeSince(this.state.activeDebugSession.start);
      const labels = this.state.getDebugSessionLabels(this.state.activeDebugSession);
      metrics.debug.secondsActive.inc(labels, time);
      delete this.state.activeDebugSession;
    }
    if (event) {
      this.state.activeDebugSession = this.state.fromDebugSession(event);
    }
  }

  private onDidChangeBreakpoints(event: vscode.BreakpointsChangeEvent) {
    this.logger.debug('received event onDidChangeBreakpoints');
    this.state.breakpoints = this.state.breakpoints ?? [];
    const removed = event.removed.map((bp) => bp.id);
    const changed = event.changed.map((bp) => bp.id);
    this.state.breakpoints = this.state.breakpoints.filter((bp) => !removed.includes(bp.id) && !changed.includes(bp.id));
    this.state.breakpoints.push(...event.changed);
    this.state.breakpoints.push(...event.added);
    const active = this.state.breakpoints.length;
    const enabled = this.state.breakpoints.filter((bp) => bp.enabled).length;
    metrics.debug.breakpointsActive.set(active);
    metrics.debug.breakpointsEnabled.set(enabled);
  }

  private onDidReceiveDebugSessionCustomEvent(event: vscode.DebugSessionCustomEvent) {
    this.logger.debug('received event onDidReceiveDebugSessionCustomEvent');
    const session = this.state.debugSessions.get(event.session.id);
    if (session) {
      const labels = this.state.getDebugSessionLabels(session);
      metrics.debug.customEvents.inc(labels, 1);
    }
  }

  private onDidStartDebugSession(event: vscode.DebugSession) {
    this.logger.debug('received event onDidStartDebugSession');
    const session = this.state.fromDebugSession(event);
    this.state.debugSessions.set(event.id, session);
    const labels = this.state.getDebugSessionLabels(session);
    metrics.debug.sessionsActive.inc(labels, 1);
  }

  private onDidTerminateDebugSession(event: vscode.DebugSession) {
    this.logger.debug('received event onDidTerminateDebugSession');
    const session = this.state.debugSessions.get(event.id);
    if (session) {
      const time = Utils.getTimeSince(session.start);
      const labels = this.state.getDebugSessionLabels(session);
      metrics.debug.secondsTotal.inc(labels, time);
      metrics.debug.sessionsActive.dec(labels, 1);
      this.state.debugSessions.delete(event.id);
    }
  }
}
