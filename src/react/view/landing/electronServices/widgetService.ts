import { Widget } from "../../../../core/db/dbEntities/widget";
import { ElectronUtil } from "../../util/electronUtil";

export class WidgetService{
    static async getWidgets(): Promise<Widget[]>{
        return ElectronUtil.invoke("getWidgets");
    }

    static async addWidget(widgetType: string): Promise<Widget[]>{
        return ElectronUtil.invoke("addWidget", widgetType);
    }

    static async removeWidget(widgetId: number): Promise<void>{
        return ElectronUtil.invoke("removeWidget", widgetId);
    }
}