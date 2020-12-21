/**
 * Created by sam on 25.02.2015.
 */
import { ILayoutElem } from './layout';
import { IPluginDesc } from '../base/plugin';
import { IDataType } from '../data/datatype';
import { IDType } from '../idtype';
import { EventHandler, IEventHandler } from '../base/event';
import { Rect } from '../geom';
export interface IViewDesc extends IPluginDesc {
    /**
     * view type. support, main
     * default: main
     */
    readonly type: string;
    /**
     * view location: left, top, bottom, right, center
     * default: center
     */
    readonly location: string;
}
export interface IView extends ILayoutElem, IEventHandler {
    readonly data: IDataType[];
    readonly idtypes: IDType[];
}
export declare abstract class AView extends EventHandler implements IView {
    private _layoutOptions;
    abstract setBounds(x: number, y: number, w: number, h: number): Promise<void> | any;
    abstract getBounds(): Rect;
    get data(): IDataType[];
    get idtypes(): IDType[];
    setLayoutOption(name: string, value: any): void;
    layoutOption<T>(name: string, defaultValue?: T): T;
    static list(): IViewDesc[];
}
