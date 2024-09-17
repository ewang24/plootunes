import React, { ReactElement } from 'react';

export interface ViewContainerProps {
    header?: ReactElement;
    content: ReactElement;
}
const ViewContainer = (props: ViewContainerProps) => {
    const { header, content } = props;
    return <div className={'p-main-container'}>
        {header &&
            <div className='p-main-header'>
                {header}
            </div>
        }
        <div className='p-main-content'>
            {content}
        </div>
    </div>
}

export default ViewContainer;