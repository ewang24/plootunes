import React from 'react';
const ViewContainer = ({children}) => {
    return <div className = {'p-overlay-view'}>
        {children}
    </div>
}

export default ViewContainer;