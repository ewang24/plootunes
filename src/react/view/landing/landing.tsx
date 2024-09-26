import React, { useEffect, useState } from 'react';
import { Widget, WidgetType, WidgetTypes } from '../../../core/db/dbEntities/widget';
import { WidgetService } from './electronServices/widgetService';
import PButton from '../global/widgets/pButton';
import { Icons } from '../../../core/assets/icons';
import PModal from '../global/widgets/pModal';
import '../../styles/landing/landing.scss'

const Landing = () => {

  const [widgets, setWidgets] = useState<Widget[] | undefined>();
  const [displayAddWidgetsModal, setDisplayAddWidgetsModal] = useState<boolean>(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType>('RECENTLY_ADDED');

  useEffect(() => {
    fetchWidgets();
  }, [])

  function fetchWidgets() {
    WidgetService.getWidgets().then((widgets: Widget[]) => {
      setWidgets(widgets);
    });
  }

  function toggleWidgetModal() {
    setDisplayAddWidgetsModal(!displayAddWidgetsModal);
  }

  function addWidgetModalContents() {
    return <div className='p-row'>
      <select value={selectedWidgetType} onChange={(event) => setSelectedWidgetType(event.target.value as WidgetType)}>
        {Object.keys(WidgetTypes).map((key) => {
          return <option value={key}>{WidgetTypes[key].displayName}</option>
        })}
      </select>
    </div>;
  }

  function createWidget() {
    WidgetService.addWidget(selectedWidgetType).then(() => {
      fetchWidgets();
      toggleWidgetModal();
    });
  }

  return <>
    {displayAddWidgetsModal &&
      <PModal
        label='Add Widget'
        content={addWidgetModalContents()}
        onClose={toggleWidgetModal}
        onSubmit={createWidget}
        displayTopRightClose={true}
      />
    }
    <div className='landing-main'>
      {
        widgets && <>
          {widgets.length === 0 &&

            <strong>
              No widgets enabled
            </strong>


          }
          <div className='p-row p-row-align-center'>
            <PButton label='Add Widget' onClick={toggleWidgetModal} icon={Icons.PLUS}></PButton>
          </div>
          {
            widgets.length > 0 &&
            <div className='landing-widgets-container'>
              {widgets.map((widget) => {
                return <div className='p-row widget-tile'>
                  {`${widget.widgetType} - ${widget.displayOrder}`}
                </div>
              })}
            </div>
          }
        </>
      }
    </div >
  </>;
};

export default Landing;
