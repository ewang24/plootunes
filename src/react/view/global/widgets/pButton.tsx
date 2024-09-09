import React, { useEffect, useState } from "react";
import '../../../styles/widgets/pbutton.scss'
import '~core-assets/file/backArrow.svg'

export interface PButtonProps {
    onClick: (event) => void;
    label: string;
    icon?: string;
}

function PButton(props: PButtonProps) {
    const { onClick, label, icon } = props;
    const [IconComponent, setIconComponent] = useState<React.FC | null>(null);

    useEffect(() => {
        if (icon) {
            console.log('importing icon');
            // Dynamically import the SVG
            import(`~core-assets/file/${icon}`)
                .then((module) => {
                    console.log('imported icon');
                    console.log(module);
                    setIconComponent(() => module.default); // Assuming @svgr/webpack is set up
                })
                .catch((error) => {
                    console.error(`Error loading icon: ${icon}`, error);
                });
        }
    }, [icon]);

    return <div className={'p-button-container'} onClick={onClick}>
        {IconComponent &&
            <div className='p-button-icon'>
                <IconComponent />
            </div>
        }
        <button id='test' className={'p-button-widget'}>
            {label}
        </button>
    </div>
}

export default PButton;