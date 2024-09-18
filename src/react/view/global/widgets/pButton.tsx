import React, { useEffect, useState } from "react";
import '../../../styles/widgets/pbutton.scss'
import { Icons } from "../../../../core/assets/icons";
import SvgBackArrow from "../../../../core/assets/icons/components/BackArrow";
import SvgHamburger from "../../../../core/assets/icons/components/Hamburger";
import SvgX from "../../../../core/assets/icons/components/X";
import SvgStop from "../../../../core/assets/icons/components/Stop";
import SvgPlay from "../../../../core/assets/icons/components/Play";
import SvgPlus from "../../../../core/assets/icons/components/Plus";


export interface PButtonProps {
    onClick: (event) => void;
    label: string;
    displayLabel?: boolean;
    icon?: string;
    iconSize?: IconSize;
    iconRight?: boolean;
}

export type IconSize = 'small' | 'medium' | 'large';

const iconMap = {}

iconMap[Icons.BACK_ARROW] = <SvgBackArrow/>;
iconMap[Icons.PLAY] = <SvgPlay/>;
iconMap[Icons.PLUS] = <SvgPlus/>;
iconMap[Icons.STOP] = <SvgStop/>;
iconMap[Icons.X] = <SvgX/>;
iconMap[Icons.HAMBURGER] = <SvgHamburger/>;


function PButton(props: PButtonProps) {
    const { onClick, label, displayLabel = true, icon, iconSize = 'small', iconRight = false } = props;
    const [IconComponent, setIconComponent] = useState<React.FC | null>(null);

    // useEffect(() => {
    //     if (icon) {
    //         console.log(JSON.stringify(iconCache));
    //         if (iconCache[icon]) {
    //             console.log(`icon ${icon} found in cache.`)
    //             setIconComponent(() => iconCache[icon]);
    //         }
    //         else {
    //             console.log(`icon ${icon} not found in cache.`)
    //             // Dynamically import the SVG
    //             //It is imported as a react component because of the svgr library so we can use it below as IconComponent
    //             import(`~core-assets/file/${icon}`)
    //                 .then((module) => {
    //                     console.log(`saving icon ${icon} to cache.`)
    //                     iconCache[icon] = module.default;
    //                     setIconComponent(() => module.default);
    //                 })
    //                 .catch((error) => {
    //                     console.error(`Error loading icon: ${icon}`, error);
    //                 });
    //         }

    //     }
    // }, [icon]);

    return <div className={'p-button-container'} onClick={onClick} title={displayLabel ? '' : label}>
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
}

export default PButton;