import { useQuery } from 'react-query';
import { ActionItem } from '../../src/models';
import { vscode } from './utilities/vscode';

export function useDemoHero() {
  const info = useQuery<ActionItem[]>('actions', fetchActions, {
    refetchOnWindowFocus: false
  });
  vscode.onNewDataAvailable(() => {
    info.refetch();
  })
  return info;
}

async function fetchActions() {
  return new Promise<ActionItem[]>((res, rej) => {
    vscode.postMessage({ command: 'getActions' });
    const dispose = vscode.onMessageReceived('getActionsResponse', (actions) => {
      res(actions);
      dispose();
    });
  })  
}
