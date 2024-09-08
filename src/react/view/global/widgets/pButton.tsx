import React from "react";
import '../../../styles/widgets/pbutton.scss'

export interface PButtonProps{
    onClick: (event) => void;
    label: string;
}

function PButton(props: PButtonProps){
    const {onClick, label} = props;
    return <button className = 'p-button-widget' onClick={onClick}>
        {label}
    </button>
}

export default PButton;