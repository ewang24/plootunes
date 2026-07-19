import React, { ReactNode } from 'react';

const OverlayView = ({ children }: { children: ReactNode }) => (
    <div className='p-overlay-view'>{children}</div>
);

export default OverlayView;
