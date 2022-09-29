import * as vscode from 'vscode';
import * as path from 'path';

export abstract class Utils {
  public static getTimeSince(time: number) {
    return (Date.now() - time) / 1000;
  }

  public static getTime() {
    const date = new Date();
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const HH = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return `${MM}-${dd}|${HH}:${mm}:${ss}`;
  }

  public static getFileName(file: string): string {
    return path.basename(file);
  }

  public static getFileFolder(file: string): string {
    const projectPath = this.getProjectFolder(file);
    return path.dirname(file).replace(projectPath, '').substring(1);
  }

  public static getProjectName(file: string): string {
    if (!vscode.workspace) return '';
    let uri = vscode.Uri.file(file);
    let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder) {
      try {
        return workspaceFolder.name;
      } catch (e) {}
    }
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length) {
      return vscode.workspace.workspaceFolders[0].name;
    }
    return vscode.workspace.name || '';
  }

  private static getProjectFolder(file: string): string {
    if (!vscode.workspace) return '';
    let uri = vscode.Uri.file(file);
    let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (workspaceFolder) {
      try {
        return workspaceFolder.uri.fsPath;
      } catch (e) {}
    }
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length) {
      return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return '';
  }
}
