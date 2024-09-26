import React, { ReactElement } from "react";
import '../../../styles/widgets/header.scss'

export type HeaderSize = 'small' | 'medium' | 'large';

export interface HeaderProps {
    label: string
    widgets?: ReactElement;
    size?: HeaderSize;
}

function Header(props: HeaderProps) {
    const { label, widgets, size } = props;
    return <div className='p-header p-row-space-between'>
        <div className='p-row label-container'>
            {(!size || size === 'large') &&
                <h1 className='p-header'>
                    {label}
                </h1>
            }
            {size === 'medium' &&
                <h2 className='p-header'>
                    {label}
                </h2>
            }
            {size === 'small' &&
                <h3 className='p-header'>
                    {label}
                </h3>
            }

        </div>
        <div className='p-row p-row-flex-end widgets-container'>
            {widgets}
        </div>
    </div>
}

export default Header;