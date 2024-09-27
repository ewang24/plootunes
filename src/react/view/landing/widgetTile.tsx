import React, { useState } from "react";
import { Widget, WidgetType, WidgetTypes } from "../../../core/db/dbEntities/widget";
import '../../styles/landing/widgetTile.scss'
import Header from "../global/widgets/header";
import QuickPlayWidget from "./widgets/quickPlayWidget";
import PlayHistoryWidget from "./widgets/playHistoryWidget";
import RecentlyAddedWidget from "./widgets/recentlyAddedWidget";
import PButton from "../global/widgets/pButton";
import { Icons } from "../../../core/assets/icons";
import PModal from "../global/widgets/pModal";
import { WidgetService } from "./electronServices/widgetService";

export interface WidgetTileProps {
    widget: Widget;
    widgetReloadHandler: () => void;
}

function getWidgetContents(widgetType: WidgetType) {
    switch (widgetType) {
        case "QUICK_PLAY":
            return <QuickPlayWidget />
        case "PLAY_HISTORY":
            return <PlayHistoryWidget />
        case "RECENTLY_ADDED":
            return <RecentlyAddedWidget />
        default:
            return <strong>Error: Unknown widget! Please delete this widget.</strong>
    }
}

const WidgetTile = (props: WidgetTileProps) => {

    const { widget, widgetReloadHandler } = props;
    const [displayEditWidgetModal, setDisplayEditWidgetsModal] = useState<boolean>(false);

    function removeWidget() {
        WidgetService.removeWidget(widget.id).then(() => {
            widgetReloadHandler();
        })
    }

    function toggleEditWidgetModal() {
        setDisplayEditWidgetsModal(!displayEditWidgetModal);
    }

    function getWidgetControls() {
        return <div className='p-row'>
            <PButton label='Remove Widget' displayLabel={false} icon={Icons.X} onClick={removeWidget} />
            <PButton label='Edit Widget' displayLabel={false} icon={Icons.HAMBURGER} onClick={toggleEditWidgetModal} />
        </div>
    }

    function getEditWidgetModalContents(){
        return <div className = 'p-row'>
            <strong>Edit widget</strong>
        </div>
    }

    return <>
        {displayEditWidgetModal &&
            <PModal label="Edit Widget Settings"
                onClose={toggleEditWidgetModal}
                displayTopRightClose={true}
                onSubmit={widgetReloadHandler}
                content={getEditWidgetModalContents()}
            />
        }
        <div className='p-col widget-tile'>
            <Header size="small" label={WidgetTypes[widget.widgetType]?.displayName || 'Error: Unknown Widget'} widgets={getWidgetControls()} />
            <div className='widget-content'>
                {getWidgetContents(widget.widgetType as WidgetType)}
            </div>
        </div>
    </>
};

export default WidgetTile;