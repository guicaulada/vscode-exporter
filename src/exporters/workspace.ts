import * as vscode from 'vscode';
import { Logger } from '../logger';
import * as metrics from '../metrics';
import { State } from '../state';

export class WorkspaceExporter {
  private logger: Logger;
  private state: State;

  constructor(logger: Logger, state: State) {
    this.logger = logger;
    this.state = state;
  }

  public setupEventListeners(): vscode.Disposable {
    this.logger.debug('setting up workspace event listeners');
    let subscriptions: vscode.Disposable[] = [];

    // vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration, this, subscriptions);
    vscode.workspace.onDidChangeNotebookDocument(this.onDidChangeNotebookDocument, this, subscriptions);
    vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument, this, subscriptions);
    vscode.workspace.onDidChangeWorkspaceFolders(this.onDidChangeWorkspaceFolders, this, subscriptions);
    vscode.workspace.onDidCloseNotebookDocument(this.onDidCloseNotebookDocument, this, subscriptions);
    vscode.workspace.onDidCloseTextDocument(this.onDidCloseTextDocument, this, subscriptions);
    vscode.workspace.onDidCreateFiles(this.onDidCreateFiles, this, subscriptions);
    vscode.workspace.onDidDeleteFiles(this.onDidDeleteFiles, this, subscriptions);
    vscode.workspace.onDidGrantWorkspaceTrust(this.onDidGrantWorkspaceTrust, this, subscriptions);
    vscode.workspace.onDidOpenNotebookDocument(this.onDidOpenNotebookDocument, this, subscriptions);
    vscode.workspace.onDidOpenTextDocument(this.onDidOpenTextDocument, this, subscriptions);
    vscode.workspace.onDidRenameFiles(this.onDidRenameFiles, this, subscriptions);
    vscode.workspace.onDidSaveNotebookDocument(this.onDidSaveNotebookDocument, this, subscriptions);
    vscode.workspace.onDidSaveTextDocument(this.onDidSaveTextDocument, this, subscriptions);
    // vscode.workspace.onWillCreateFiles(this.onWillCreateFiles, this, subscriptions);
    // vscode.workspace.onWillDeleteFiles(this.onWillDeleteFiles, this, subscriptions);
    // vscode.workspace.onWillRenameFiles(this.onWillRenameFiles, this, subscriptions);
    // vscode.workspace.onWillSaveTextDocument(this.onWillSaveTextDocument, this, subscriptions);

    return vscode.Disposable.from(...subscriptions);
  }

  private onDidChangeNotebookDocument(event: vscode.NotebookDocumentChangeEvent) {
    this.logger.debug('received event onDidChangeNotebookDocument');
    const notebook = this.state.fromNotebook(event.notebook);
    const labels = this.state.getNotebookLabels(notebook);
    metrics.workspace.notebookContentChanges.inc(labels, event.contentChanges.length);
    metrics.workspace.notebookCellChanges.inc(labels, event.cellChanges.length);
  }

  private onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent) {
    this.logger.debug('received event onDidChangeTextDocument');
    const docuemnt = this.state.fromDocument(event.document);
    const labels = this.state.getDocumentLabels(docuemnt);
    metrics.workspace.editorsContentChanges.inc(labels, event.contentChanges.length);
  }

  private onDidChangeWorkspaceFolders(event: vscode.WorkspaceFoldersChangeEvent) {
    this.logger.debug('received event onDidChangeWorkspaceFolders');
    const added = this.mapFoldersByLabel(event.added);
    added.forEach((n, jsonLabels) => {
      const labels = JSON.parse(jsonLabels);
      metrics.workspace.foldersAdded.inc(labels, n);
    });

    const removed = this.mapFoldersByLabel(event.added);
    removed.forEach((n, jsonLabels) => {
      const labels = JSON.parse(jsonLabels);
      metrics.workspace.foldersRemoved.inc(labels, n);
    });
  }

  private onDidCloseNotebookDocument(event: vscode.NotebookDocument) {
    this.logger.debug('received event onDidCloseNotebookDocument');
    const notebook = this.state.fromNotebook(event);
    const labels = this.state.getNotebookLabels(notebook);
    metrics.workspace.notebooksClosed.inc(labels, 1);
  }

  private onDidCloseTextDocument(event: vscode.TextDocument) {
    this.logger.debug('received event onDidCloseTextDocument');
    const document = this.state.fromDocument(event);
    const labels = this.state.getDocumentLabels(document);
    metrics.workspace.documentsClosed.inc(labels, 1);
  }

  private onDidCreateFiles(event: vscode.FileCreateEvent) {
    this.logger.debug('received event onDidCreateFiles');
    const files = this.mapFilesByLabel(event.files);
    files.forEach((n, jsonLabels) => {
      const labels = JSON.parse(jsonLabels);
      metrics.workspace.filesAdded.inc(labels, n);
    });
  }

  private onDidDeleteFiles(event: vscode.FileDeleteEvent) {
    this.logger.debug('received event onDidDeleteFiles');
    const files = this.mapFilesByLabel(event.files);
    files.forEach((n, jsonLabels) => {
      const labels = JSON.parse(jsonLabels);
      metrics.workspace.filesRemoved.inc(labels, n);
    });
  }

  private onDidGrantWorkspaceTrust() {
    this.logger.debug('received event onDidGrantWorkspaceTrust');
    const labels = this.state.getActiveProjectLabel();
    metrics.workspace.trustGrant.inc(labels, 1);
  }

  private onDidOpenNotebookDocument(event: vscode.NotebookDocument) {
    this.logger.debug('received event onDidOpenNotebookDocument');
    const notebook = this.state.fromNotebook(event);
    const labels = this.state.getNotebookLabels(notebook);
    metrics.workspace.notebooksOpened.inc(labels, 1);
  }

  private onDidOpenTextDocument(event: vscode.TextDocument) {
    this.logger.debug('received event onDidOpenTextDocument');
    const document = this.state.fromDocument(event);
    const labels = this.state.getDocumentLabels(document);
    metrics.workspace.documentsOpened.inc(labels, 1);
  }

  private onDidRenameFiles(event: vscode.FileRenameEvent) {
    this.logger.debug('received event onDidRenameFiles');
    const files = this.mapRenamesByLabel(event.files);
    files.forEach((n, jsonLabels) => {
      const labels = JSON.parse(jsonLabels);
      metrics.workspace.filesRenamed.inc(labels, n);
    });
  }

  private onDidSaveNotebookDocument(event: vscode.NotebookDocument) {
    this.logger.debug('received event onDidSaveNotebookDocument');
    const notebook = this.state.fromNotebook(event);
    const labels = this.state.getNotebookLabels(notebook);
    metrics.workspace.notebooksSaved.inc(labels, 1);
  }

  private onDidSaveTextDocument(event: vscode.TextDocument) {
    this.logger.debug('received event onDidSaveTextDocument');
    const document = this.state.fromDocument(event);
    const labels = this.state.getDocumentLabels(document);
    metrics.workspace.documentsSaved.inc(labels, 1);
  }

  private mapFoldersByLabel(folders: readonly vscode.WorkspaceFolder[]) {
    return this.mapFilesByLabel(folders.map((f) => f.uri));
  }

  private mapFilesByLabel(files: readonly vscode.Uri[]) {
    return files.reduce<Map<string, number>>((m, f) => {
      const labels = this.state.getUriLabels(f);
      const jsonLabels = JSON.stringify(labels);
      const count = m.get(jsonLabels) ?? 0;
      m.set(jsonLabels, count + 1);
      return m;
    }, new Map());
  }

  private mapRenamesByLabel(files: vscode.FileRenameEvent['files']) {
    return files.reduce<Map<string, number>>((m, f) => {
      const labels = this.state.getRenameLabels(f.oldUri, f.newUri);
      const jsonLabels = JSON.stringify(labels);
      const count = m.get(jsonLabels) ?? 0;
      m.set(jsonLabels, count + 1);
      return m;
    }, new Map());
  }
}
