import * as vscode from 'vscode';
import type { ExtensionContext, FileSystemWatcher } from 'vscode';
import { readFile, watchFile, writeFile } from './fileUtils';
import { ActionItem } from './models';

type OnChangeListener = () => void;

export class DemoHeroService {
  private storageFile = './.demoHeroActions.json';
  private actionItems: ActionItem[] = [];
  private readonly onChangeListeners: OnChangeListener[] = [];
  private watcher?: FileSystemWatcher;

  constructor(private extensionsContext: ExtensionContext) {
    this.load();
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('demoHero')) {
        this.load();
      }
    });
  }

  private async load() {
    if (this.watcher) {
      this.watcher.dispose();
      this.watcher = undefined;
    }
    const config = vscode.workspace.getConfiguration('demoHero');
    this.storageFile = config.get<string>('storageFile', this.storageFile);
    let fileContents = (await readFile(this.storageFile, false)) || '[]';
    const array = JSON.parse(fileContents);
    this.actionItems = array;
    this.notifyChangeListeners();
    this.watcher = await watchFile(this.storageFile);
    if (this.watcher) {
      this.watcher.onDidChange((e) => {
        this.load();
      });
      this.watcher.onDidDelete(e => {
        this.load();
      });
    }
  }

  onChange(listener: OnChangeListener) {
    this.onChangeListeners.push(listener);
  }

  getAction(actionId: string) {
    return this.actionItems.find((x) => x.id === actionId);
  }

  getActions(): ActionItem[] {
    return this.actionItems;
  }

  addAction(action: ActionItem) {
    action.id = generateId();
    this.actionItems.push(action);
    this.save();
  }

  deleteAction(id: string) {
    this.actionItems = this.actionItems.filter((x) => x.id !== id);
    this.save();
  }

  moveUpAction(id: string) {
    const index = this.actionItems.findIndex((x) => x.id === id);
    if (index <= 0) {
      return;
    }
    const actionItem = this.actionItems.splice(index, 1)[0];
    this.actionItems.splice(index - 1, 0, actionItem);
    this.save();
  }

  moveDownAction(id: string) {
    const index = this.actionItems.findIndex((x) => x.id === id);
    if (index <= -1 || index + 1 === this.actionItems.length) {
      return;
    }
    const actionItem = this.actionItems.splice(index, 1)[0];
    this.actionItems.splice(index + 1, 0, actionItem);
    this.save();
  }

  private async save() {
    const string = JSON.stringify(this.actionItems, undefined, 2);
    await writeFile(this.storageFile, string);
    if (!this.watcher) {
      this.load();
    }
  }

  private notifyChangeListeners() {
    this.onChangeListeners.forEach((c) => c());
  }
}

function generateId(): string {
  return Math.floor((1 + Math.random()) * 0x1000000000000)
    .toString()
    .substring(0, 6);
}
