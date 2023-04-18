import * as prom from 'prom-client';

export const notebookContentChanges = new prom.Counter({
  name: 'vscode_notebooks_content_changes_total',
  help: 'Total number of content changes in notebooks by project, folder, file, type and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'type', 'is_untitled'],
});

export const notebookCellChanges = new prom.Counter({
  name: 'vscode_notebooks_cell_changes_total',
  help: 'Total number of cell changes in notebooks by project, folder, file, type and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'type', 'is_untitled'],
});

export const editorsContentChanges = new prom.Counter({
  name: 'vscode_editors_content_changes_total',
  help: 'Total number of content changes in editor by project, folder, file, language and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'type', 'language', 'is_untitled'],
});

export const foldersAdded = new prom.Counter({
  name: 'vscode_workspace_folders_added',
  help: 'Total number of folders added in workspace by project, folder and name.',
  labelNames: ['project', 'folder', 'name'],
});

export const foldersRemoved = new prom.Counter({
  name: 'vscode_workspace_folders_removed',
  help: 'Total number of folders removed in workspace by project, folder and name.',
  labelNames: ['project', 'folder', 'name'],
});

export const notebooksClosed = new prom.Counter({
  name: 'vscode_workspace_notebooks_closed',
  help: 'Total number of notebooks closed in workspace by project, folder, file, type and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'type', 'is_untitled'],
});

export const documentsClosed = new prom.Counter({
  name: 'vscode_workspace_documents_closed',
  help: 'Total number of documents closed in workspace by project, folder, file, language and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'language', 'is_untitled'],
});

export const filesAdded = new prom.Counter({
  name: 'vscode_workspace_files_added',
  help: 'Total number of files added in workspace by project, folder and name.',
  labelNames: ['project', 'folder', 'name'],
});

export const filesRemoved = new prom.Counter({
  name: 'vscode_workspace_files_removed',
  help: 'Total number of files removed in workspace by project, folder and name.',
  labelNames: ['project', 'folder', 'name'],
});

export const trustGrant = new prom.Counter({
  name: 'vscode_workspace_trust_grants',
  help: 'Total number of trust grants in workspace by project.',
  labelNames: ['project'],
});

export const notebooksOpened = new prom.Counter({
  name: 'vscode_workspace_notebooks_opened',
  help: 'Total number of notebooks opened in workspace by project, folder, file, type and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'type', 'is_untitled'],
});

export const documentsOpened = new prom.Counter({
  name: 'vscode_workspace_documents_opened',
  help: 'Total number of documents opened in workspace by project, folder, file, language and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'language', 'is_untitled'],
});

export const filesRenamed = new prom.Counter({
  name: 'vscode_workspace_files_renamed',
  help: 'Total number of files renamed in workspace by project, folder and name.',
  labelNames: ['project', 'folder', 'name'],
});

export const notebooksSaved = new prom.Counter({
  name: 'vscode_workspace_notebooks_saved',
  help: 'Total number of notebooks saved in workspace by project, folder, file, type and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'type', 'is_untitled'],
});

export const documentsSaved = new prom.Counter({
  name: 'vscode_workspace_documents_saved',
  help: 'Total number of documents saved in workspace by project, folder, file, language and if is untitled.',
  labelNames: ['project', 'folder', 'file', 'language', 'is_untitled'],
});
