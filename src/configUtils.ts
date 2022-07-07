/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

type GetConfig = Pick<typeof vscode.workspace, 'getConfiguration'>;

interface EditorForegroundColors {
  'editorWarning.foreground': string;
  'editorError.foreground': string;
  'editorInfo.foreground': string;
}

export async function disableEditorErrors(workspace: GetConfig) {
  const demoHeroConfig = vscode.workspace.getConfiguration('demoHero');
  const hideErrorsInTypeMode = demoHeroConfig.get<boolean>(
    'hideErrorsInTypeMode',
    true
  );

  const currentColors = getEditorColorConfig(vscode.workspace);

  if (hideErrorsInTypeMode) {
    await saveEditorColorConfig(vscode.workspace, {
      'editorWarning.foreground': '#00000000',
      'editorError.foreground': '#00000000',
      'editorInfo.foreground': '#00000000',
    });
  }

  return async () => {
    if (hideErrorsInTypeMode) {
      saveEditorColorConfig(workspace, currentColors);
    }
  };
}

export async function validateEditorColorConfig(workspace: GetConfig) {
  const colors = getEditorColorConfig(workspace);
  if (!colors) {
    return;
  }

  if (
    colors['editorError.foreground'] === '#00000000' &&
    colors['editorInfo.foreground'] === '#00000000' &&
    colors['editorWarning.foreground'] === '#00000000'
  ) {
    // Config colors where probably left in an invalid state, so fix
    return await saveEditorColorConfig(workspace, undefined);
  }
}

function getEditorColorConfig(workspace: GetConfig) {
  const workbenchConfig = workspace.getConfiguration('workbench');
  const inspect = workbenchConfig.inspect<EditorForegroundColors>(
    'colorCustomizations'
  );

  if (inspect?.workspaceValue) {
    return inspect.workspaceValue;
  }
}

async function saveEditorColorConfig(
  workspace: GetConfig,
  colors: EditorForegroundColors | undefined
) {
  const workbenchConfig = workspace.getConfiguration('workbench');
  await workbenchConfig.update(
    'colorCustomizations',
    colors,
    vscode.ConfigurationTarget.Workspace
  );
}
