import React from 'react';
import {
  VSCodeButton,
  VSCodeDataGrid,
  VSCodeDataGridCell,
  VSCodeDataGridRow,
  VSCodeDropdown,
  VSCodeOption,
} from '@vscode/webview-ui-toolkit/react';
import { useDemoHero } from '../hooks';
import ActionListItem from './ActionListItem';

interface DemoHeroActionListProps {}

const ActionList: React.FC<DemoHeroActionListProps> = () => {
  const { isLoading, data } = useDemoHero();

  if (isLoading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ul>
        {data.map((a) => {
          return <ActionListItem />;
        })}
      </ul>
    </div>
  );
};

export default ActionList;
