export interface WidgetTypeOption{
    value: string;
    displayName: string;
}

export const WidgetTypes = {
    QUICK_PLAY: { value: "QUICK_PLAY", displayName: "Quick Play" },
    PLAY_HISTORY: { value: "PLAY_HISTORY", displayName: "Play History" },
    RECENTLY_ADDED: { value: "RECENTLY_ADDED", displayName: "Recently Added" },
} as const;

export type WidgetType = keyof typeof WidgetTypes;

export interface Widget{
    id: number;
    widgetType: string;
    displayOrder: number;
}