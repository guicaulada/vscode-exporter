import * as vscode from 'vscode';
import { Logger } from './logger';
import { Utils } from './utils';

interface DebugState {
  id: string;
  name: string;
  type: string;
  folder: string;
  start: number;
}

interface TaskState {
  name: string;
  type: string;
  source: string;
  isBackground: boolean;
  start: number;
}

interface NotebookState {
  fileName: string;
  type: string;
  file: string;
  folder: string;
  project: string;
  cellCount: number;
  isUntitled: boolean;
  version: number;
  start: number;
}

interface TerminalState {
  name: string;
  start: number;
}

interface DocumentState {
  fileName: string;
  language: string;
  isUntitled: boolean;
  file: string;
  folder: string;
  project: string;
  charCount: number;
  lineCount: number;
  version: number;
  start: number;
}

interface FocusState {
  focused: boolean;
  start: number;
}

export class State {
  private logger: Logger;
  // debug
  public activeDebugSession?: DebugState;
  public breakpoints: vscode.Breakpoint[] = [];
  public debugSessions: Map<string, DebugState> = new Map();
  // tasks
  public tasks: Map<string, TaskState> = new Map();
  public processes: Map<number, TaskState> = new Map();
  //window
  public colorTheme?: string;
  public activeNotebook?: NotebookState;
  public activeTerminal?: TerminalState;
  public activeDocument?: DocumentState;
  public terminals: Map<number, TerminalState> = new Map();
  public focus: FocusState = {
    focused: true,
    start: Date.now(),
  };

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public fromDebugSession(session: vscode.DebugSession): DebugState {
    return {
      id: session.id,
      name: session.name,
      type: session.type,
      folder: session.workspaceFolder?.name ?? '',
      start: Date.now(),
    };
  }

  public getDebugSessionLabels(session: DebugState) {
    return {
      id: session.id,
      name: session.name,
      type: session.type,
      folder: session.folder,
    };
  }

  public fromTask(task: vscode.Task): TaskState {
    return {
      name: task.name,
      type: task.definition.type,
      source: task.source,
      isBackground: task.isBackground,
      start: Date.now(),
    };
  }

  public getTaskLabels(task: TaskState) {
    return {
      name: task.name,
      type: task.type,
      source: task.source,
      is_background: task.isBackground ? 'true' : 'false',
    };
  }

  public fromDocument(document: vscode.TextDocument) {
    return {
      fileName: document.fileName,
      project: Utils.getProjectName(document.fileName),
      folder: Utils.getFileFolder(document.fileName),
      file: Utils.getFileName(document.fileName),
      language: document.languageId,
      isUntitled: document.isUntitled,
      charCount: document.getText().length,
      lineCount: document.lineCount,
      version: document.version,
      start: Date.now(),
    };
  }

  public getDocumentLabels(document: DocumentState) {
    return {
      project: document.project,
      folder: document.folder,
      file: document.file,
      language: document.language,
      is_untitled: document.isUntitled ? 'true' : 'false',
    };
  }

  public fromNotebook(notebook: vscode.NotebookDocument) {
    return {
      type: notebook.notebookType,
      fileName: notebook.uri.fsPath,
      project: Utils.getProjectName(notebook.uri.fsPath),
      folder: Utils.getFileFolder(notebook.uri.fsPath),
      file: Utils.getFileName(notebook.uri.fsPath),
      cellCount: notebook.cellCount,
      isUntitled: notebook.isUntitled,
      version: notebook.version,
      start: Date.now(),
    };
  }

  public getNotebookLabels(editor: NotebookState) {
    return {
      project: editor.project,
      folder: editor.folder,
      file: editor.file,
      type: editor.type,
      is_untitled: editor.isUntitled ? 'true' : 'false',
    };
  }

  public getUriLabels(uri: vscode.Uri) {
    return {
      project: Utils.getProjectName(uri.fsPath),
      folder: Utils.getFileFolder(uri.fsPath),
      name: Utils.getFileName(uri.fsPath),
    };
  }

  public getRenameLabels(oldUri: vscode.Uri, newUri: vscode.Uri) {
    const oldLabels = this.getUriLabels(oldUri);
    const newLabels = this.getUriLabels(newUri);
    return {
      old_project: oldLabels.project,
      new_project: newLabels.project,
      old_folder: oldLabels.folder,
      new_folder: newLabels.folder,
      old_name: oldLabels.name,
      new_name: newLabels.name,
    };
  }

  public getActiveProjectLabel() {
    if (this.activeDocument) {
      return { project: this.activeDocument.project };
    }
    if (this.activeNotebook) {
      return { project: this.activeNotebook.project };
    }
    return { project: '' };
  }
}
