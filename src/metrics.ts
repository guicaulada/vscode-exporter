import * as prom from 'prom-client';

export const lineCount = new prom.Gauge({
  name: 'vscode_lines_total',
  help: 'Total lines by project, folder, file, extension and language',
  labelNames: ['project', 'folder', 'file', 'extension', 'language'],
});

export const timeSpentEditing = new prom.Counter({
  name: 'vscode_editing_seconds',
  help: 'Time spent editing files by project, folder, file, extension and language in seconds',
  labelNames: ['project', 'folder', 'file', 'extension', 'language'],
});

export const timeSpentDebugging = new prom.Counter({
  name: 'vscode_debugging_seconds',
  help: 'Time spent debugging files by project, folder, file, extension and language in seconds',
  labelNames: ['project', 'folder', 'file', 'extension', 'language'],
});

export const timeSpentCompiling = new prom.Counter({
  name: 'vscode_compiling_seconds',
  help: 'Time spent compiling files by project, folder, file, extension and language in seconds',
  labelNames: ['project', 'folder', 'file', 'extension', 'language'],
});

export const timeSpentIdle = new prom.Counter({
  name: 'vscode_idle_seconds',
  help: 'Time spent idle in files by project, folder, file, extension and language in seconds',
  labelNames: ['project', 'folder', 'file', 'extension', 'language'],
});
