import * as prom from 'prom-client';

export const notebookSecondsActive = new prom.Counter({
  name: 'vscode_notebooks_seconds_active',
  help: 'Duration of active notebook sessions by project, folder, file, type and if is untitled in seconds.',
  labelNames: ['project', 'folder', 'file', 'type', 'is_untitled'],
});

export const notebookCells = new prom.Gauge({
  name: 'vscode_notebooks_cells',
  help: 'Number of cells by notebook project, folder, file, type and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'type', 'is_untitled'],
});

export const terminalSecondsTotal = new prom.Counter({
  name: 'vscode_terminals_seconds_total',
  help: 'Total duration of terminal sessions by name and exit code in seconds.',
  labelNames: ['name', 'exit_code'],
});

export const terminalSecondsActive = new prom.Counter({
  name: 'vscode_terminals_seconds_active',
  help: 'Duration of active terminal sessions by name and exit code in seconds.',
  labelNames: ['name'],
});

export const terminalActive = new prom.Gauge({
  name: 'vscode_terminals_active',
  help: 'Number of active terminal sessions by name.',
  labelNames: ['name'],
});

export const editorSecondsActive = new prom.Counter({
  name: 'vscode_editor_seconds_active',
  help: 'Duration of active text editors by project, folder, file, language and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'language', 'is_untitled'],
});

export const charactersTotal = new prom.Gauge({
  name: 'vscode_characters_total',
  help: 'Total number of characters by project, folder, file, language and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'language', 'is_untitled'],
});

export const linesTotal = new prom.Gauge({
  name: 'vscode_lines_total',
  help: 'Total number of lines by project, folder, file, language and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'language', 'is_untitled'],
});

export const editorsEdits = new prom.Counter({
  name: 'vscode_editors_edits_total',
  help: 'Total number of edits on text editors by project, folder, file, language and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'language', 'is_untitled'],
});

export const notebooksEdits = new prom.Counter({
  name: 'vscode_notebooks_edits_total',
  help: 'Total number of edits on text notebooks by project, folder, file, language and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'language', 'is_untitled'],
});

export const visibleNotebooks = new prom.Gauge({
  name: 'vscode_notebooks_visible',
  help: 'Number of visible notebooks sessions by project, folder, file, type and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'type', 'is_untitled'],
});

export const visibleEditors = new prom.Gauge({
  name: 'vscode_editors_visible',
  help: 'Number of visible editors by project, folder, file, language and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'language', 'is_untitled'],
});

export const focusedSecondsActive = new prom.Counter({
  name: 'vscode_seconds_active',
  help: 'Duration VSCode was active in seconds.',
  labelNames: ['focused'],
});
