import React from "react";
import { Button } from "@ploot/pds";
import type { PdsIconName } from "@ploot/pds";

// Icon name mapping from old Icons enum values to PDS icon names
const iconNameMap: Record<string, PdsIconName> = {
  "backArrow.svg": "backArrow",
  "play": "play",
  "plus": "plus",
  "stop": "stop",
  "x": "x",
  "hamburger": "hamburger",
  "shuffle": "shuffle",
  "repeatCircle": "repeatCircle",
  "rewind": "rewind",
  "fastForward": "fastForward",
};

export interface PButtonProps {
  onClick: (event?) => void;
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

function PButton(props: PButtonProps) {
  const {
    onClick,
    label,
    displayLabel = true,
    icon,
    iconSize = 'small',
    iconType = 'primary',
    iconRight = false,
    fill,
  } = props;

  const pdsIcon = icon ? iconNameMap[icon] : undefined;

  const sizeMap: Record<IconSize, 'sm' | 'md' | 'lg'> = {
    small: 'sm',
    medium: 'md',
    large: 'lg',
  };

  const variant = iconType === 'borderless' ? 'ghost' : 'primary';
  const size = sizeMap[iconSize];

  // fill prop was used to color icons; apply inline style to override when needed
  const style: React.CSSProperties = fill
    ? ({ '--pds-icon-fill-override': fill } as React.CSSProperties)
    : {};

  return (
    <Button
      variant={variant}
      size={size}
      icon={pdsIcon}
      iconOnRight={iconRight}
      title={!displayLabel && label ? label : undefined}
      onClick={onClick}
      style={style}
    >
      {displayLabel ? label : undefined}
    </Button>
  );
}

export default PButton;
