/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {IdPool} from '../index';
import {SelectOperation, defaultSelectionType} from './IIDType';
import IDType from './IDType';

export interface IHasUniqueId {
  id: number;
}

export function toId(elem: IHasUniqueId) {
  return elem.id;
}

export function isId(id: number) {
  return (elem: IHasUniqueId) => elem && elem.id === id;
}

/**
 * IDType with an actual collection of entities.
 * Supports selections.
 */
export default class ObjectManager<T extends IHasUniqueId> extends IDType {
  private readonly instances: T[] = [];
  private readonly pool = new IdPool();

  constructor(id: string, name: string) {
    super(id, name, name + 's', true);
  }

  nextId(item?: T) {
    const n = this.pool.checkOut()!;
    if (item) {
      item.id = n;
      this.instances[n] = item;
      this.fire('add', n, item);
    }
    return n;
  }

  push(...items: T[]) {
    items.forEach((item) => {
      this.instances[item.id] = item;
      this.fire('add', item.id, item);
    });
  }

  byId(id: number) {
    return this.instances[id];
  }

  forEach(callbackfn: (value: T) => void, thisArg?: any): void {
    this.instances.forEach((item, i) => this.pool.isCheckedOut(i) ? callbackfn.call(thisArg, item) : null);
  }

  get entries() {
    return this.instances.filter((_item, i) => this.pool.isCheckedOut(i));
  }

  remove(item: T|number): T {
    let old = null;
    let id = typeof item === 'number' ? item : item.id;
    old = this.instances[id]!;
    delete this.instances[id];
    this.fire('remove', id, old);
    //clear from selections
    this.selectionTypes().forEach((type) => {
      this.select(type, [id], SelectOperation.REMOVE);
    });
    this.pool.checkIn(id);
    return old;
  }

  selectedObjects(type = defaultSelectionType) {
    const s = this.selections(type);
    return s.filter(this.instances);
  }
}
