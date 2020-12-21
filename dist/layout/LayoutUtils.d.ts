/**
 * Created by Samuel Gratzl on 15.12.2014.
 */
import { IPadding, ILayoutElem } from './layout';
export declare class LayoutUtils {
    static padding(v: number): IPadding;
    static noPadding: IPadding;
    static flowLayout(horizontal: boolean, gap: number, padding?: {
        top: number;
        left: number;
        right: number;
        bottom: number;
    }): (elems: ILayoutElem[], w: number, h: number, parent: ILayoutElem) => Promise<boolean>;
    static distributeLayout(horizontal: boolean, defaultValue: number, padding?: IPadding): (elems: ILayoutElem[], w: number, h: number, parent: ILayoutElem) => Promise<boolean>;
    static borderLayout(horizontal: boolean, gap: number, percentages?: IPadding, padding?: IPadding): (elems: ILayoutElem[], w: number, h: number, parent: ILayoutElem) => Promise<boolean>;
    static layers(elems: ILayoutElem[], w: number, h: number, parent: ILayoutElem): Promise<boolean>;
    static waitFor(promises: Promise<any>[], redo?: boolean): Promise<boolean>;
    static grab(definition: number, v: number): number;
    private static isDefault;
}
