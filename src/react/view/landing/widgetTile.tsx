import React from "react";
import { Widget, WidgetTypes } from "../../../core/db/dbEntities/widget";
import '../../styles/landing/widgetTile.scss'
import Header from "../global/widgets/header";

export interface WidgetTileProps {
    widget: Widget;
}

const WidgetTile = (props: WidgetTileProps) => {
    const { widget } = props;
    return <div className='p-col widget-tile'>
        <Header size="small" label={WidgetTypes[widget.widgetType]?.displayName || 'Error: Unknown Widget'} />
        <div className='widget-content'>
            {`${WidgetTypes[widget.widgetType]?.displayName || 'Error: Unknown Widget'} - ${widget.displayOrder}`}
        </div>
    </div>
};

export default WidgetTile;