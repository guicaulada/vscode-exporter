import * as vscode from 'vscode';

import { Logger } from './logger';
import { VSCodeExporter } from './exporter';

var logger = new Logger();
var exporter: VSCodeExporter;

export function activate(ctx: vscode.ExtensionContext) {
  exporter = new VSCodeExporter(logger);

  ctx.subscriptions.push(
    vscode.commands.registerCommand('vscode-exporter.open', function () {
      exporter.openMetrics();
    }),
  );

  ctx.subscriptions.push(exporter);
  exporter.initialize();
}

export function deactivate() {
  exporter.dispose();
}
