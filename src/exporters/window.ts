import * as vscode from 'vscode';
import { Logger } from '../logger';
import * as metrics from '../metrics';
import { State } from '../state';
import { Utils } from '../utils';

export class WindowExporter {
  private logger: Logger;
  private state: State;

  constructor(logger: Logger, state: State) {
    this.logger = logger;
    this.state = state;
  }

  public setupEventListeners(): vscode.Disposable {
    this.logger.debug('setting up window event listeners');
    let subscriptions: vscode.Disposable[] = [];

    vscode.window.onDidChangeActiveColorTheme(this.onDidChangeActiveColorTheme, this, subscriptions);
    vscode.window.onDidChangeActiveNotebookEditor(this.onDidChangeActiveNotebookEditor, this, subscriptions);
    vscode.window.onDidChangeActiveTerminal(this.onDidChangeActiveTerminal, this, subscriptions);
    vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor, this, subscriptions);
    vscode.window.onDidChangeNotebookEditorSelection(this.onDidChangeNotebookEditorSelection, this, subscriptions);
    vscode.window.onDidChangeNotebookEditorVisibleRanges(this.onDidChangeNotebookEditorVisibleRanges, this, subscriptions);
    vscode.window.onDidChangeTerminalState(this.onDidChangeTerminalState, this, subscriptions);
    vscode.window.onDidChangeTextEditorOptions(this.onDidChangeTextEditorOptions, this, subscriptions);
    vscode.window.onDidChangeTextEditorSelection(this.onDidChangeTextEditorSelection, this, subscriptions);
    vscode.window.onDidChangeTextEditorViewColumn(this.onDidChangeTextEditorViewColumn, this, subscriptions);
    vscode.window.onDidChangeTextEditorVisibleRanges(this.onDidChangeTextEditorVisibleRanges, this, subscriptions);
    vscode.window.onDidChangeVisibleNotebookEditors(this.onDidChangeVisibleNotebookEditors, this, subscriptions);
    vscode.window.onDidChangeVisibleTextEditors(this.onDidChangeVisibleTextEditors, this, subscriptions);
    vscode.window.onDidChangeWindowState(this.onDidChangeWindowState, this, subscriptions);
    vscode.window.onDidCloseTerminal(this.onDidCloseTerminal, this, subscriptions);
    vscode.window.onDidOpenTerminal(this.onDidOpenTerminal, this, subscriptions);

    return vscode.Disposable.from(...subscriptions);
  }

  private onDidChangeActiveColorTheme(event: vscode.ColorTheme) {
    this.logger.debug('received event onDidChangeActiveColorTheme');
    this.state.colorTheme = vscode.ColorThemeKind[event.kind];
  }

  private onDidChangeActiveNotebook(notebook?: vscode.NotebookDocument) {
    this.logger.debug('received event onDidChangeActiveNotebook');
    if (this.state.activeNotebook) {
      const time = Utils.getTimeSince(this.state.activeNotebook.start);
      const labels = this.state.getNotebookLabels(this.state.activeNotebook);
      metrics.window.notebookSecondsActive.inc(labels, time);
      metrics.window.notebookCells.set(labels, this.state.activeNotebook.cellCount);
      if (notebook && notebook.uri.fsPath === this.state.activeNotebook.fileName && notebook.version > this.state.activeNotebook.version) {
        const editCount = notebook.version - this.state.activeNotebook.version;
        metrics.window.notebooksEdits.inc(labels, editCount);
      }
      delete this.state.activeNotebook;
    }
    if (notebook) {
      this.state.activeNotebook = this.state.fromNotebook(notebook);
      const labels = this.state.getNotebookLabels(this.state.activeNotebook);
      metrics.window.notebookCells.set(labels, notebook.cellCount);
    }
  }

  private onDidChangeActiveNotebookEditor(event?: vscode.NotebookEditor) {
    this.logger.debug('received event onDidChangeActiveNotebookEditor');
    if (event) {
      this.onDidChangeActiveNotebook(event.notebook);
    } else {
      this.onDidChangeActiveNotebook();
    }
  }

  private onDidChangeActiveTerminal(event?: vscode.Terminal) {
    this.logger.debug('received event onDidChangeActiveTerminal');
    if (this.state.activeTerminal) {
      const name = this.state.activeTerminal.name;
      const time = Utils.getTimeSince(this.state.activeTerminal.start);
      metrics.window.terminalSecondsActive.inc({ name }, time);
      delete this.state.activeTerminal;
    }
    if (event) {
      this.state.activeTerminal = {
        name: event.name,
        start: Date.now(),
      };
    }
  }

  private onDidChangeActiveTextEditor(event?: vscode.TextEditor) {
    this.logger.debug('received event onDidChangeActiveTextEditor');
    if (this.state.activeDocument) {
      const time = Utils.getTimeSince(this.state.activeDocument.start);
      const labels = this.state.getDocumentLabels(this.state.activeDocument);
      metrics.window.editorSecondsActive.inc(labels, time);
      metrics.window.charactersTotal.set(labels, this.state.activeDocument.charCount);
      metrics.window.linesTotal.set(labels, this.state.activeDocument.lineCount);
      if (event && event.document.fileName === this.state.activeDocument.fileName && event.document.version > this.state.activeDocument.version) {
        const editCount = event.document.version - this.state.activeDocument.version;
        metrics.window.editorsEdits.inc(labels, editCount);
      }
      delete this.state.activeDocument;
    }
    if (event) {
      this.state.activeDocument = this.state.fromDocument(event.document);
      const labels = this.state.getDocumentLabels(this.state.activeDocument);
      metrics.window.charactersTotal.set(labels, this.state.activeDocument.charCount);
      metrics.window.linesTotal.set(labels, this.state.activeDocument.lineCount);
    }
  }

  private onDidChangeNotebookEditorSelection(event: vscode.NotebookEditorSelectionChangeEvent) {
    this.logger.debug('received event onDidChangeNotebookEditorSelection');
    this.onDidChangeActiveNotebook(event.notebookEditor.notebook);
  }

  private onDidChangeNotebookEditorVisibleRanges(event: vscode.NotebookEditorVisibleRangesChangeEvent) {
    this.logger.debug('received event onDidChangeNotebookEditorVisibleRanges');
    this.onDidChangeActiveNotebook(event.notebookEditor.notebook);
  }

  private onDidChangeTerminalState(event: vscode.Terminal) {
    this.logger.debug('received event onDidChangeTerminalState');
    this.onDidChangeActiveTerminal(event);
  }

  private onDidChangeTextEditorOptions(event: vscode.TextEditorOptionsChangeEvent) {
    this.logger.debug('received event onDidChangeTextEditorOptions');
    this.onDidChangeActiveTextEditor(event.textEditor);
  }

  private onDidChangeTextEditorSelection(event: vscode.TextEditorSelectionChangeEvent) {
    this.logger.debug('received event onDidChangeTextEditorSelection');
    this.onDidChangeActiveTextEditor(event.textEditor);
  }

  private onDidChangeTextEditorViewColumn(event: vscode.TextEditorViewColumnChangeEvent) {
    this.logger.debug('received event onDidChangeTextEditorViewColumn');
    this.onDidChangeActiveTextEditor(event.textEditor);
  }

  private onDidChangeTextEditorVisibleRanges(event: vscode.TextEditorVisibleRangesChangeEvent) {
    this.logger.debug('received event onDidChangeTextEditorVisibleRanges');
    this.onDidChangeActiveTextEditor(event.textEditor);
  }

  private onDidChangeVisibleNotebookEditors(event: readonly vscode.NotebookEditor[]) {
    this.logger.debug('received event onDidChangeVisibleNotebookEditors');
    const notebooksByType = this.mapNotebooksByLabel(event);
    notebooksByType.forEach((n, jsonLabels) => {
      const labels = JSON.parse(jsonLabels);
      metrics.window.visibleNotebooks.set(labels, n);
    });
  }

  private onDidChangeVisibleTextEditors(event: readonly vscode.TextEditor[]) {
    this.logger.debug('received event onDidChangeVisibleTextEditors');
    const editors = this.mapEditorsByLabel(event);
    editors.forEach((n, jsonLabels) => {
      const labels = JSON.parse(jsonLabels);
      metrics.window.visibleEditors.set(labels, n);
    });
  }

  private onDidChangeWindowState(event: vscode.WindowState) {
    this.logger.debug('received event onDidChangeWindowState');
    if (this.state.focus.start) {
      const focused = this.state.focus.focused ? 'true' : 'false';
      const time = Utils.getTimeSince(this.state.focus.start);
      metrics.window.focusedSecondsActive.inc({ focused }, time);
    }
    if (!event.focused) {
      this.onDidChangeActiveNotebookEditor();
      this.onDidChangeActiveTerminal();
      this.onDidChangeActiveTextEditor();
    }
    this.state.focus.focused = event.focused;
    this.state.focus.start = Date.now();
  }

  private async onDidCloseTerminal(event: vscode.Terminal) {
    const processId = await event.processId;
    if (processId) {
      const terminal = this.state.terminals.get(processId);
      if (terminal) {
        const labels = { name: terminal.name, exit_code: event.exitStatus?.code ?? '' };
        const time = Utils.getTimeSince(terminal.start);
        metrics.window.terminalSecondsTotal.inc(labels, time);
      }
    }
    metrics.window.terminalActive.dec({ name: event.name }, 1);
  }

  private async onDidOpenTerminal(event: vscode.Terminal) {
    const terminal = {
      name: event.name,
      start: Date.now(),
    };
    const processId = await event.processId;
    if (processId) {
      this.state.terminals.set(processId, terminal);
    }
    metrics.window.terminalActive.inc({ name: event.name }, 1);
  }

  private mapEditorsByLabel(editors: readonly vscode.TextEditor[]) {
    return editors.reduce<Map<string, number>>((m, e) => {
      const document = this.state.fromDocument(e.document);
      const labels = this.state.getDocumentLabels(document);
      const jsonLabels = JSON.stringify(labels);
      const count = m.get(jsonLabels) ?? 0;
      m.set(jsonLabels, count + 1);
      return m;
    }, new Map());
  }

  private mapNotebooksByLabel(editors: readonly vscode.NotebookEditor[]) {
    return editors.reduce<Map<string, number>>((m, e) => {
      const notebook = this.state.fromNotebook(e.notebook);
      const labels = this.state.getNotebookLabels(notebook);
      const jsonLabels = JSON.stringify(labels);
      const count = m.get(jsonLabels) ?? 0;
      m.set(jsonLabels, count + 1);
      return m;
    }, new Map());
  }
}
