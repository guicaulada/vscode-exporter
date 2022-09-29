import * as prom from 'prom-client';

export const secondsTotal = new prom.Counter({
  name: 'vscode_tasks_seconds_total',
  help: 'Total duration of tasks by name, type and if is background in seconds.',
  labelNames: ['name', 'type', 'source', 'is_background'],
});

export const tasksActive = new prom.Gauge({
  name: 'vscode_tasks_active',
  help: 'Number of active tasks by name, type and if is background.',
  labelNames: ['name', 'type', 'source', 'is_background'],
});

export const processActive = new prom.Gauge({
  name: 'vscode_tasks_process_active',
  help: 'Number of active processes by task name, type and if is background.',
  labelNames: ['name', 'type', 'source', 'is_background'],
});

export const processTotal = new prom.Counter({
  name: 'vscode_tasks_process_total',
  help: 'Number of active processes by task name, type, if is background and exit code.',
  labelNames: ['name', 'type', 'source', 'is_background', 'exit_code'],
});
