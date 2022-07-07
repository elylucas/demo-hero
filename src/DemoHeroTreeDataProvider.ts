import * as vscode from 'vscode';
import { DemoHeroService } from './DemoHeroService';

export class DemoHeroTreeDataProvider
  implements vscode.TreeDataProvider<DemoHeroTreeItem>
{
  private changeEvent = new vscode.EventEmitter<void>();

  public get onDidChangeTreeData() {
    return this.changeEvent.event;
  }

  constructor(private demoHeroService: DemoHeroService) {
    demoHeroService.onChange(() => this.changeEvent.fire());
  }

  getTreeItem(element: DemoHeroTreeItem): vscode.TreeItem {
    return element;
  }

  private getItems(): DemoHeroTreeItem[] {
    const items = this.demoHeroService.getActions().map((action) => {
      return new DemoHeroTreeItem(
        action.id!,
        action.name,
        {
          arguments: [action.id],
          command: 'demoHero.executeAction',
          title: 'Execute Action',
        }
      );
    });

    return items;
  }

  getChildren(): Thenable<DemoHeroTreeItem[]> {
    return Promise.resolve(this.getItems());
  }

}

export class DemoHeroTreeItem extends vscode.TreeItem {
  constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly command: vscode.Command
  ) {
    super(label);
  }
}
