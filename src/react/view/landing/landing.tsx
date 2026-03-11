import React, { useEffect, useState } from 'react';
import { Widget, WidgetType, WidgetTypes } from '../../../core/db/dbEntities/widget';
import { WidgetService } from './electronServices/widgetService';
import { Button, useModal } from '@ploot/pds';
import '../../styles/landing/landing.scss'
import WidgetTile from './widgetTile';

const Landing = () => {

  const [widgets, setWidgets] = useState<Widget[] | undefined>();
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType>('RECENTLY_ADDED');

  useEffect(() => {
    fetchWidgets();
  }, [])

  function fetchWidgets() {
    WidgetService.getWidgets().then((widgets: Widget[]) => {
      setWidgets(widgets);
    });
  }

  function createWidget() {
    WidgetService.addWidget(selectedWidgetType).then(() => {
      fetchWidgets();
      closeAddWidget();
    });
  }

  const { open: openAddWidget, close: closeAddWidget, Modal: AddWidgetModal } = useModal({
    title: 'Add Widget',
    renderContent: (close) => (
      <div className='p-row'>
        <select value={selectedWidgetType} onChange={(event) => setSelectedWidgetType(event.target.value as WidgetType)}>
          {Object.keys(WidgetTypes).map((key) => {
            return <option key={key} value={key}>{WidgetTypes[key].displayName}</option>
          })}
        </select>
        <Button onClick={() => { createWidget(); }} variant="primary">Submit</Button>
        <Button onClick={close} variant="secondary">Close</Button>
      </div>
    ),
  });

  return <>
    <AddWidgetModal />
    <div className='landing-main'>
      {
        widgets && <>
          {widgets.length === 0 &&
            <strong>
              No widgets enabled
            </strong>
          }
          <div className='p-row p-row-align-center'>
            <Button onClick={openAddWidget} icon="plus" variant="primary">Add Widget</Button>
          </div>
          {
            widgets.length > 0 &&
            <div className='landing-widgets-container'>
              {widgets.map((widget) => {
                return <WidgetTile key={widget.id} widget={widget} widgetReloadHandler={fetchWidgets}/>
              })}
            </div>
          }
        </>
      }
    </div >
  </>;
};

export default Landing;
