import React, { ReactElement } from "react";
import { Tab } from "@ploot/pds";

export interface PTabItem {
  label: string;
  content: ReactElement;
  active?: boolean;
}

export interface PTabsProps {
  tabs: PTabItem[];
}

function PTabs(props: PTabsProps) {
  const { tabs } = props;

  const activeItem = tabs.find((t) => t.active);
  const initialSelectedTab = activeItem ? activeItem.label : tabs[0]?.label;

  const items = tabs.map((tab) => ({
    id: tab.label,
    name: tab.label,
    content: tab.content,
  }));

  return (
    <Tab
      initialSelectedTab={initialSelectedTab}
      items={items}
    />
  );
}

export default PTabs;
