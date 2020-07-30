/**
 * Created by Samuel Gratzl on 01.12.2016.
 */
import { Store } from './Store';
import { IDType } from '../idtype/IDType';
export interface ISelectionSyncerOptions {
    filter?(idType: IDType): boolean;
    selectionTypes?: string[];
}
export declare class SelectionSyncerOptionUtils {
    private static syncIDType;
    static create(store: Store, options?: ISelectionSyncerOptions): any;
}
