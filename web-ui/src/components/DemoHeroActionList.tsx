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

interface DemoHeroActionListProps {}

const DemoHeroActionList: React.FC<DemoHeroActionListProps> = () => {
  const result = useDemoHero();

  if (result.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <VSCodeDataGrid aria-label="actions list">
        <VSCodeDataGridRow rowType="header">
          <VSCodeDataGridCell cellType="columnheader" grid-column="1">
            Name
          </VSCodeDataGridCell>
          <VSCodeDataGridCell cellType="columnheader" grid-column="1">
            Type
          </VSCodeDataGridCell>
        </VSCodeDataGridRow>
        {result.data?.map((x, i) => (
          <VSCodeDataGridRow key={i}>
            <VSCodeDataGridCell>{x.name}</VSCodeDataGridCell>
            <VSCodeDataGridCell>{x.type}</VSCodeDataGridCell>
          </VSCodeDataGridRow>
        ))}
      </VSCodeDataGrid>
      <VSCodeDropdown>
        {result.data?.map((x, i) => (
          <VSCodeOption>{x.name}</VSCodeOption>
        ))}
      </VSCodeDropdown>
      <select name="Name_of_list_box" size={3}>
        <option> List item 1 </option>
        <option> List item 2 </option>
        <option> List item 3 </option>
        <option> List item N </option>
        <option> List item N </option>
        <option> List item N </option>
        <option> List item N </option>
      </select>
    </div>
  );
};

export default DemoHeroActionList;
