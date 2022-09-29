import * as prom from 'prom-client';

export const secondsTotal = new prom.Counter({
  name: 'vscode_debug_seconds_total',
  help: 'Total duration of debug sessions by id, name, type and folder in seconds.',
  labelNames: ['id', 'name', 'type', 'folder'],
});

export const secondsActive = new prom.Counter({
  name: 'vscode_debug_seconds_active',
  help: 'Duration of active debug sessions by id, name, type and folder in seconds.',
  labelNames: ['id', 'name', 'type', 'folder'],
});

export const sessionsActive = new prom.Gauge({
  name: 'vscode_debug_sessions_active',
  help: 'Number of active debug sessions by id, name, type and folder.',
  labelNames: ['id', 'name', 'type', 'folder'],
});

export const breakpointsEnabled = new prom.Gauge({
  name: 'vscode_breakpoints_enabled',
  help: 'Number of enabled breakpoints by session id, name, type and folder.',
  labelNames: ['id', 'name', 'type', 'folder'],
});

export const breakpointsActive = new prom.Gauge({
  name: 'vscode_breakpoints_active',
  help: 'Number of active breakpoints by session id, name, type and folder.',
  labelNames: ['id', 'name', 'type', 'folder'],
});

export const customEvents = new prom.Counter({
  name: 'vscode_debug_custom_events',
  help: 'Number of custom events received on debug sessions by id, name, type and folder.',
  labelNames: ['id', 'name', 'type', 'folder'],
});
