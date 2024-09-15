import React, { useEffect, useState } from "react";
import '../../../styles/widgets/pbutton.scss'
import '~core-assets/file/backArrow.svg'

export interface PButtonProps {
    onClick: (event) => void;
    label: string;
    displayLabel?: boolean;
    icon?: string;
    iconSize?: IconSize;
    iconRight?: boolean;
}

export type IconSize = 'small' | 'medium' | 'large'

function PButton(props: PButtonProps) {
    const { onClick, label, displayLabel = true, icon, iconSize = 'small', iconRight = false } = props;
    const [IconComponent, setIconComponent] = useState<React.FC | null>(null);

    useEffect(() => {
        if (icon) {
            console.log('importing icon');
            // Dynamically import the SVG
            //It is imported as a react component because of the svgr library so we can use it below as IconComponent
            import(`~core-assets/file/${icon}`)
                .then((module) => {
                    setIconComponent(() => module.default);
                })
                .catch((error) => {
                    console.error(`Error loading icon: ${icon}`, error);
                });
        }
    }, [icon]);

    return <div className={'p-button-container'} onClick={onClick} title={displayLabel ? '' : label}>
        {IconComponent && !iconRight &&
            <div className={`p-button-icon p-button-${iconSize}`}>
                <IconComponent />
            </div>
        }
        {displayLabel &&
            <button id='test' className={'p-button-widget'}>
                {label}
            </button>
        }
        {IconComponent && iconRight &&
            <div className={`p-button-icon p-button-${iconSize}`}>
                <IconComponent />
            </div>
        }
    </div>
}

export default PButton;