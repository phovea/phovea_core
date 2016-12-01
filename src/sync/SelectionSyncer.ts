/**
 * Created by Samuel Gratzl on 01.12.2016.
 */

import {mixin} from '../';
import Store from './Store';
import {IDType, list as listIDTypes, defaultSelectionType} from '../idtype';
import {Range} from '../range';
import {on as globalOn} from '../event';

const PREFIX = 'selection-idtype-';

export interface ISelectionSyncerOptions {
  filter?(idType: IDType): boolean;
  selectionTypes?: string[];
}

function syncIDType(store: Store, idType: IDType, options: ISelectionSyncerOptions) {
  options.selectionTypes.forEach((type) => {
    const key = `${PREFIX}${idType.id}-${type}`;
    idType.on('select-' + type, (event, type: string, selection: Range) => {
      store.setValue(key, selection.toString());
    });
    store.on(key, (event, new_: string) => {
      idType.select(type, new_);
    });
  });
}


export function create(store: Store, options?: ISelectionSyncerOptions) {
  options = mixin({
    filter: () => true,
    selectionTypes: [defaultSelectionType] // by default just selections
  }, options);

  // store existing
  const toSync = listIDTypes().filter((idType) => (idType instanceof IDType && options.filter(<IDType>idType)));
  toSync.forEach((idType) => syncIDType(store, <IDType>idType, options));

  // watch new ones
  globalOn('register.idtype', (event, idType: IDType) => {
    if (options.filter(idType)) {
      syncIDType(store, idType, options);
    }
  });
  return null;
}
