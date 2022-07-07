import { join } from 'path';
import * as vscode from 'vscode';

export async function createFile(path: string, content: string = '') {
  if (!vscode.workspace.workspaceFolders) {
    return;
  }
  const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const fullPath = join(workspaceFolder, path);
  const uri = vscode.Uri.file(fullPath);
  const fileExists = await exists(uri);
  if (!fileExists) {
    const writeStr = Buffer.from(content, 'utf8');
    await vscode.workspace.fs.writeFile(uri, writeStr);
  } else {
    vscode.window.showInformationMessage(`${path} already exists`);
  }
  return uri;
}

export async function writeFile(path: string, content: string) {
  if (!vscode.workspace.workspaceFolders) {
    return;
  }
  const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const fullPath = join(workspaceFolder, path);
  const uri = vscode.Uri.file(fullPath);
  const writeStr = Buffer.from(content, 'utf8');
  await vscode.workspace.fs.writeFile(uri, writeStr);
  return uri;
}

export async function readFile(
  path: string,
  warnOnFileMissing: boolean = true
) {
  if (!vscode.workspace.workspaceFolders) {
    return;
  }
  const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const fullPath = join(workspaceFolder, path);
  const uri = vscode.Uri.file(fullPath);
  const fileExists = await exists(uri);
  if (!fileExists) {
    if (warnOnFileMissing) {
      vscode.window.showWarningMessage(`${path} not found`);
    }
    return;
  }

  const array = await vscode.workspace.fs.readFile(uri);
  const buffer = Buffer.from(array);
  return buffer.toString('utf8');
}

export async function watchFile(path: string) {
  if (!vscode.workspace.workspaceFolders) {
    return;
  }
  const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const fullPath = join(workspaceFolder, path);
  const uri = vscode.Uri.file(fullPath);
  const fileExists = await exists(uri);
  if (!fileExists) {
    return;
  }
  const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);
  const relativePattern = new vscode.RelativePattern(
    vscode.workspace.workspaceFolders[0],
    fileName
  );
  return vscode.workspace.createFileSystemWatcher(relativePattern);
}

export async function createFolder(path: string) {
  if (!vscode.workspace.workspaceFolders) {
    return;
  }
  const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const fullPath = join(workspaceFolder, path);
  const uri = vscode.Uri.file(fullPath);
  const folderExists = await exists(uri);
  if (!folderExists) {
    await vscode.workspace.fs.createDirectory(uri);
  } else {
    vscode.window.showInformationMessage(`${path} already exists`);
  }
}

async function exists(uri: vscode.Uri) {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch (e) {
    return false;
  }
}


