// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import * as vscode from 'vscode';

import { DemoHeroService } from './DemoHeroService';
import { DemoHeroTreeDataProvider } from './DemoHeroTreeDataProvider';
import {
  registerAddAction,
  registerDeleteAction,
  registerExecuteAction,
  registerInsertCodeFragmentAction,
  registerMoveDownAction,
  registerMoveUpAction,
  registerSaveCodeFragmentAction,
} from './commands';
import { DemoHeroWebPanel } from './DemoHeroWebPanel';
import { validateEditorColorConfig } from './configUtils';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // validateEditorColorConfig(vscode.workspace);
  const demoHeroService = new DemoHeroService(context);

  vscode.window.registerTreeDataProvider(
    'demoHeroTreeView',
    new DemoHeroTreeDataProvider(demoHeroService)
  );

  context.subscriptions.push(registerAddAction(demoHeroService));
  context.subscriptions.push(registerDeleteAction(demoHeroService));
  context.subscriptions.push(registerMoveUpAction(demoHeroService));
  context.subscriptions.push(registerMoveDownAction(demoHeroService));
  context.subscriptions.push(registerExecuteAction(demoHeroService));
  context.subscriptions.push(registerInsertCodeFragmentAction(demoHeroService));
  context.subscriptions.push(registerSaveCodeFragmentAction(demoHeroService));

  const showDemoHeroWebPanel = vscode.commands.registerCommand(
    'demoHero.showDemoHeroWebPanel',
    () => {
      DemoHeroWebPanel.render(context.extensionUri, demoHeroService);
    }
  );

  context.subscriptions.push(showDemoHeroWebPanel);
}

// this method is called when your extension is deactivated
export async function deactivate() {
  return await validateEditorColorConfig(vscode.workspace);
}
