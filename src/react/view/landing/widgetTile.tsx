import React from "react";
import { Button, Card, useModal } from "@ploot/pds";
import { Widget, WidgetType, WidgetTypes } from "../../../core/db/dbEntities/widget";
import QuickPlayWidget from "./widgets/quickPlayWidget";
import PlayHistoryWidget from "./widgets/playHistoryWidget";
import RecentlyAddedWidget from "./widgets/recentlyAddedWidget";
import { WidgetService } from "./electronServices/widgetService";

export interface WidgetTileProps {
  widget: Widget;
  widgetReloadHandler: () => void;
}

function getWidgetContents(widgetType: WidgetType) {
  switch (widgetType) {
    case "QUICK_PLAY": return <QuickPlayWidget />;
    case "PLAY_HISTORY": return <PlayHistoryWidget />;
    case "RECENTLY_ADDED": return <RecentlyAddedWidget />;
    default: return <strong>Error: Unknown widget! Please delete this widget.</strong>;
  }
}

const WidgetTile = ({ widget, widgetReloadHandler }: WidgetTileProps) => {
  function removeWidget() {
    WidgetService.removeWidget(widget.id).then(widgetReloadHandler);
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

  return <>
    <EditWidgetModal />
    <Card className='widget-tile'>
      <div className='widget-tile-header'>
        <span className='widget-tile-title'>{WidgetTypes[widget.widgetType]?.displayName || 'Unknown Widget'}</span>
        <div className='p-row'>
          <Button icon='hamburger' variant='ghost' size='sm' onClick={openEditModal} title='Edit Widget' />
          <Button icon='x' variant='ghost' size='sm' onClick={removeWidget} title='Remove Widget' />
        </div>
      </div>
      <div className='widget-content'>
        {getWidgetContents(widget.widgetType as WidgetType)}
      </div>
    </Card>
  </>;
};

export default WidgetTile;
