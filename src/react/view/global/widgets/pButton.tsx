import React, { useEffect, useRef, useState } from "react";
import '../../../styles/widgets/pbutton.scss'
import { Icons } from "../../../../core/assets/icons";
import SvgBackArrow from "../../../../core/assets/icons/components/BackArrow";
import SvgHamburger from "../../../../core/assets/icons/components/Hamburger";
import SvgX from "../../../../core/assets/icons/components/X";
import SvgStop from "../../../../core/assets/icons/components/Stop";
import SvgPlay from "../../../../core/assets/icons/components/Play";
import SvgPlus from "../../../../core/assets/icons/components/Plus";
import SvgShuffle from "../../../../core/assets/icons/components/Shuffle";
import { v4 as uuidv4 } from 'uuid';
import SvgRepeatCircle from "../../../../core/assets/icons/components/RepeatCircle";
import SvgRewind from "../../../../core/assets/icons/components/Rewind";
import SvgFastForward from "../../../../core/assets/icons/components/FastForward";


export interface PButtonProps {
    onClick: (event) => void;
    label: string;
    displayLabel?: boolean;
    icon?: string;
    iconSize?: IconSize;
    iconType?: IconType;
    iconRight?: boolean;
    fill?: string;
}

export type IconSize = 'small' | 'medium' | 'large';
export type IconType = 'primary' | 'borderless';

const iconMap = {}

iconMap[Icons.BACK_ARROW] = <SvgBackArrow />;
iconMap[Icons.PLAY] = <SvgPlay />;
iconMap[Icons.PLUS] = <SvgPlus />;
iconMap[Icons.STOP] = <SvgStop />;
iconMap[Icons.X] = <SvgX />;
iconMap[Icons.HAMBURGER] = <SvgHamburger />;
iconMap[Icons.SHUFFLE] = <SvgShuffle />;
iconMap[Icons.REPEAT_CIRCLE] = <SvgRepeatCircle />;
iconMap[Icons.REWIND] = <SvgRewind />;
iconMap[Icons.FAST_FORWARD] = <SvgFastForward />;


function PButton(props: PButtonProps) {
    const { onClick, label, displayLabel = true, icon, iconSize = 'small', iconRight = false, fill, iconType = 'primary' } = props;
    const uuid = useRef<string>('b' + uuidv4());
    return <>
        {fill &&
            <style>
                {
                `
                    #${uuid.current}.p-button-container:not(:hover) .p-button-icon svg path {
                        fill: ${fill} !important;
                        stroke: ${fill} !important;
                    }
                `
                }
            </style>
        }
        <div id={uuid.current} className={`p-button-container ${iconType}`} onClick={onClick} title={displayLabel ? '' : label}>
            {icon && !iconRight &&
                <div className={`p-button-icon p-button-${iconSize}`}>
                    {iconMap[icon]}
                </div>
            }
            {displayLabel &&
                <button id='test' className={'p-button-widget'}>
                    {label}
                </button>
            }
            {icon && iconRight &&
                <div className={`p-button-icon p-button-${iconSize}`}>
                    {iconMap[icon]}
                </div>
            }
        </div>
    </>
}

export default PButton;