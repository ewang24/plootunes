import React, { ReactElement } from "react";
import '../../../styles/widgets/header.scss'

export interface HeaderProps {
    label: string
    widgets?: ReactElement[]
}

function Header(props: HeaderProps) {
    const { label, widgets } = props;
    return <div className='p-header p-row-space-between'>
        <div className = 'p-row label-container'>
            <h1 className='p-header'>
                {label}
            </h1>
        </div>
        <div className='p-row p-row-flex-end widgets-container'>
            {widgets}
        </div>
    </div>
}

export default Header;