import * as vscode from 'vscode';
import { createFile, createFolder } from './fileUtils';
import { DemoHeroService } from './DemoHeroService';
import { ActionItem } from './models';
import { DemoHeroTreeItem } from './DemoHeroTreeDataProvider';
import { Position, Selection } from 'vscode';
import { disableEditorErrors } from './configUtils';

export function registerAddAction(demoHeroService: DemoHeroService) {
  return vscode.commands.registerCommand('demoHero.addAction', async () => {
    const actionType = await vscode.window.showQuickPick(
      ['CreateFile', 'CreateFolder', 'CodeFragment'],
      {
        placeHolder: 'Choose the action type..',
      }
    );

    if (actionType === 'CodeFragment') {
      vscode.window.showWarningMessage(
        `Code Fragments are created by selecting text and running the demoHero.saveCodeFragment command`
      );
      return;
    }

    const actionName = await vscode.window.showInputBox({
      ignoreFocusOut: false,
      placeHolder: 'Action Name',
      prompt: 'Give the action a name...',
    });
    if (!actionName) {
      return;
    }

    if (actionType === 'CreateFile') {
      const filePath = await vscode.window.showInputBox({
        ignoreFocusOut: false,
        placeHolder: '',
        prompt: 'Relative path of file to create...',
      });
      if (!filePath) {
        return;
      }
      demoHeroService.addAction({
        id: '',
        name: actionName,
        type: 'CreateFile',
        path: filePath,
      });
    }

    if (actionType === 'CreateFolder') {
      const folderPath = await vscode.window.showInputBox({
        ignoreFocusOut: false,
        placeHolder: '',
        prompt: 'Relative path of folder to create...',
      });
      if (!folderPath) {
        return;
      }
      demoHeroService.addAction({
        id: '',
        name: actionName,
        type: 'CreateFolder',
        path: folderPath,
      });
    }
  });
}

export function registerDeleteAction(demoHeroService: DemoHeroService) {
  return vscode.commands.registerCommand(
    'demoHero.deleteAction',
    (demoHeroTreeItem?: DemoHeroTreeItem) => {
      if (demoHeroTreeItem) {
        vscode.window
          .showInformationMessage(
            `Are you sure you want to delete this action: ${demoHeroTreeItem.label}?`,
            'Yes',
            'No'
          )
          .then((answer) => {
            if (answer === 'Yes') {
              demoHeroService.deleteAction(demoHeroTreeItem.id);
              vscode.window.showInformationMessage(
                `Deleted Action: ${demoHeroTreeItem.label}`
              );
            }
          });
      }
    }
  );
}

export function registerMoveUpAction(demoHeroService: DemoHeroService) {
  return vscode.commands.registerCommand(
    'demoHero.moveUpAction',
    (demoHeroTreeItem?: DemoHeroTreeItem) => {
      if (demoHeroTreeItem) {
        demoHeroService.moveUpAction(demoHeroTreeItem.id);
      }
    }
  );
}

export function registerMoveDownAction(demoHeroService: DemoHeroService) {
  return vscode.commands.registerCommand(
    'demoHero.moveDownAction',
    (demoHeroTreeItem?: DemoHeroTreeItem) => {
      if (demoHeroTreeItem) {
        demoHeroService.moveDownAction(demoHeroTreeItem.id);
      }
    }
  );
}

export function registerExecuteAction(demoHeroService: DemoHeroService) {
  return vscode.commands.registerCommand(
    'demoHero.executeAction',
    async (actionId: string) => {
      const action = demoHeroService.getAction(actionId);
      if (!action) {
        return;
      }

      switch (action.type) {
        case 'CreateFile': {
          const uri = await createFile(action.path, action.withContent);
          await vscode.commands.executeCommand('vscode.open', uri);
          break;
        }
        case 'CreateFolder': {
          const uri = await createFolder(action.path);
          await vscode.commands.executeCommand('vscode.open', uri);
          break;
        }
        case 'CodeFragment': {
          await vscode.commands.executeCommand(
            'demoHero.insertCodeFragment',
            action.id
          );
          break;
        }
      }
    }
  );
}

export function registerInsertCodeFragmentAction(
  demoHeroService: DemoHeroService
) {
  return vscode.commands.registerCommand(
    'demoHero.insertCodeFragment',
    async (actionId) => {
      if (!actionId) {
        vscode.window.showInformationMessage(
          'Insert a code fragment into the editor by clicking on it in the Code Fragments view.'
        );
      }

      const enableEditorErrors = await disableEditorErrors(vscode.workspace);

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage(
          'Open a file in the editor to insert a fragment.'
        );
        return;
      }

      const actionItem = demoHeroService.getAction(actionId);
      if (!actionItem || actionItem.type !== 'CodeFragment') {
        return;
      }
      const content = actionItem.content;
      const useWords = !!actionItem.fullWord;
      if (content) {
        if (actionItem.delay) {
          let chars: string[] = [...content];

          // if (useWords) {
          //   chars = content.match(/\b(\w+\W+)/g) || [];
          //   console.log({ chars: JSON.stringify(chars) });
          // } else {
          //   chars = [...content];
          // }

          let char = chars.shift();
          let position = editor.selection.start;
          while (char) {
            await editor.edit(async (builder) => {
              editor.selection = new Selection(position, position);
              let textToType = char;
              if (useWords) {
                let nextChar = chars.shift();
                while (nextChar) {
                  textToType += nextChar;
                  if (nextChar === '\n' || nextChar === ' ') {
                    break;
                  }
                  nextChar = chars.shift();
                }
              }

              builder.insert(editor.selection.active, textToType!);
              if (textToType!.indexOf('\n') >= 0) {
                position = new Position(position.line + 1, position.character);
                editor.revealRange(
                  editor.selection,
                  vscode.TextEditorRevealType.InCenter
                );
              } else {
                position = new Position(
                  position.line,
                  position.character + textToType!.length
                );
              }
              char = chars.shift();
            });
            await new Promise((res) => setTimeout(res, actionItem.delay));
          }
        } else {
          editor.edit(async (builder) => {
            builder.insert(editor.selection.start, content);
          });
        }
      }

      enableEditorErrors();
    }
  );
}

export function registerSaveCodeFragmentAction(demoHeroService: DemoHeroService) {
  return vscode.commands.registerCommand(
    'demoHero.saveCodeFragment',
    async () => {
      const showNoTextMsg = () =>
        vscode.window.showInformationMessage(
          'Select a piece of code in the editor to save it as a fragment.'
        );

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        showNoTextMsg();
        return;
      }

      editor.edit(async (builder) => {
        const content = editor.document.getText(editor.selection);

        if (content.length < 1) {
          showNoTextMsg();
          return;
        }

        const opt: vscode.InputBoxOptions = {
          ignoreFocusOut: false,
          placeHolder: 'Code Fragment Action Name',
          prompt: 'Give the fragment action a cool name...',
        };

        const label = await vscode.window.showInputBox(opt);
        if (!label) {
          return;
        }
        const action: ActionItem = {
          id: '',
          name: label,
          type: 'CodeFragment',
          content,
        };
        demoHeroService.addAction(action);
      });
    }
  );
}
