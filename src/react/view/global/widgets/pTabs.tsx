import React, { ReactElement, useState } from "react";
import '../../../styles/widgets/ptabs.scss'

export interface PTabItem {
    label: string,
    content: ReactElement;
    active?: boolean;
}

export interface PTabsProps {
    tabs: PTabItem[];
}

function PTabs(props: PTabsProps) {
    const { tabs } = props;
    const [activeTab, setActiveTab] = useState<number>(() => {
        let activeIndex = 0;
        for (let i = tabs.length - 1; i > 0; i--) {
            if (tabs[i].active) {
                activeIndex = i;
                break;
            }
        }

        return activeIndex;
    });

    function switchTab(index) {
        setActiveTab(index);
    }

    return <div className="p-col p-tabs">
        <div className='p-row p-row-flex-start p-tab-headers-container'>
            {tabs.map((tab, index) => {
                return <div key={index} className={`p-tab-header ${index === activeTab ? 'active' : ''}`} onClick={() => switchTab(index)}>
                    <span>
                        {tab.label}
                    </span>
                    <div className = 'active-highlight'></div>
                </div>
            })}
        </div>
        <div key={activeTab}>
            {
                tabs[activeTab].content
            }
        </div>
    </div>
}

export default PTabs;