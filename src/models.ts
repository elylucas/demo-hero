type ActionTypeStrings = 'CreateFolder' | 'CreateFile' | 'CodeFragment';

export type ActionItem =
  | CreateFolderAction
  | CreateFileAction
  | CodeFragmentAction;

interface ActionItemBase {
  id: string;
  name: string;
  type: ActionTypeStrings;
}

export interface CodeFragmentAction extends ActionItemBase {
  type: 'CodeFragment';
  content: string;
  delay?: number;
  fullWord?: boolean;
}

export interface CreateFolderAction extends ActionItemBase {
  type: 'CreateFolder';
  path: string;
}

export interface CreateFileAction extends ActionItemBase {
  type: 'CreateFile';
  path: string;
  withContent?: string;
}
