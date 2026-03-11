import React from "react";
import { Widget, WidgetType, WidgetTypes } from "../../../core/db/dbEntities/widget";
import '../../styles/landing/widgetTile.scss'
import Header from "../global/widgets/header";
import QuickPlayWidget from "./widgets/quickPlayWidget";
import PlayHistoryWidget from "./widgets/playHistoryWidget";
import RecentlyAddedWidget from "./widgets/recentlyAddedWidget";
import { Button, useModal } from "@ploot/pds";
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

    function removeWidget() {
        WidgetService.removeWidget(widget.id).then(() => {
            widgetReloadHandler();
        });
    }

    const { open: openEditModal, Modal: EditWidgetModal } = useModal({
        title: 'Edit Widget Settings',
        renderContent: (close) => (
            <div className='p-row'>
                <strong>Edit widget</strong>
                <Button onClick={() => { widgetReloadHandler(); close(); }} variant="primary">Submit</Button>
                <Button onClick={close} variant="secondary">Close</Button>
            </div>
        ),
    });

    function getWidgetControls() {
        return <div className='p-row'>
            <Button icon="x" onClick={removeWidget} variant="ghost" title="Remove Widget" />
            <Button icon="hamburger" onClick={openEditModal} variant="ghost" title="Edit Widget" />
        </div>
    }

    return <>
        <EditWidgetModal />
        <div className='p-col widget-tile'>
            <Header size="small" label={WidgetTypes[widget.widgetType]?.displayName || 'Error: Unknown Widget'} widgets={getWidgetControls()} />
            <div className='widget-content'>
                {getWidgetContents(widget.widgetType as WidgetType)}
            </div>
        </div>
    </>
};

export default WidgetTile;
