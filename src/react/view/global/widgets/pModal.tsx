import React, { ReactElement } from "react";
import '../../../styles/widgets/pmodal.scss'
import Header from "./header";
import PButton from "./pButton";
import { Icons } from "../../../../core/assets/icons";

export interface PModalProps {
    label: string;
    content: ReactElement;
    onSubmit?: () => void;
    onClose: () => void;
    displayTopRightClose?: boolean;
}

function PModal(props: PModalProps) {
    const { content, label, onSubmit, onClose, displayTopRightClose } = props;

    function headerWidgets() {
        return <>
            {
                displayTopRightClose && <PButton label="Close" displayLabel={false} onClick={onClose} icon={Icons.X} />
            }
        </>
    }

    return <div className='p-modal-main'>
        <div className='p-modal-header'>
            <Header label={label} size="small" widgets={headerWidgets()} />
        </div>
        <div className='p-modal-content'>
            {content}
        </div>
        <div className = 'p-modal-footer p-row p-row-flex-end'>
            {
                onSubmit && 
                <PButton label= 'Submit' onClick={onSubmit}/>
            }
            <PButton label = 'Close' onClick={onClose}/>
        </div>
    </div>
}

export default PModal;