/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {EventHandler, IEventHandler, IEventListener} from '../event';
import {none, all, Range, join, RangeLike, parse} from '../range';
import {SelectOperation, defaultSelectionType, fillWithNone, asSelectOperation} from './IIDType';
import IDType from './IDType';

export interface ISelectAble extends IEventHandler {
  ids(range?: RangeLike): Promise<Range>;

  fromIdRange(idRange?: RangeLike);

  readonly idtypes: IDType[];

  selections(type?: string);

  select(range: RangeLike);
  select(range: RangeLike, op: SelectOperation);
  select(type: string, range: RangeLike);
  select(type: string, range: RangeLike, op: SelectOperation);
  select(dim: number, range: RangeLike);
  select(dim: number, range: RangeLike, op: SelectOperation);
  select(dim: number, type: string, range: RangeLike);
  select(dim: number, type: string, range: RangeLike, op: SelectOperation);

  /**
   * clear the specific selection (type) and dimension
   */
  clear();
  clear(type: string);
  clear(dim: number);
  clear(dim: number, type: string);
}


export abstract class ASelectAble extends EventHandler implements ISelectAble {
  static readonly EVENT_SELECT = IDType.EVENT_SELECT;

  private numSelectListeners = 0;
  private selectionListeners = [];
  private singleSelectionListener = (event: any, type: string, act: Range, added: Range, removed: Range) => {
    this.ids().then((ids: Range) => {
      //filter to the right ids and convert to indices format
      //given all ids convert the selected ids to the indices in the data type
      act = ids.indexOf(act);
      added = ids.indexOf(added);
      removed = ids.indexOf(removed);
      if (act.isNone && added.isNone && removed.isNone) {
        return;
      }
      //ensure the right number of dimensions
      fillWithNone(act, ids.ndim);
      fillWithNone(added, ids.ndim);
      fillWithNone(removed, ids.ndim);

      this.fire(ASelectAble.EVENT_SELECT, type, act, added, removed);
      this.fire(`${ASelectAble.EVENT_SELECT}-${type}`, act, added, removed);
    });
  };
  private selectionCache = [];
  private accumulateEvents = -1;

  abstract ids(range?: RangeLike): Promise<Range>;

  fromIdRange(idRange: RangeLike = all()) {
    return this.ids().then((ids) => {
      return ids.indexOf(parse(idRange));
    });
  }

  abstract get idtypes(): IDType[];

  private selectionListener(idtype: IDType, index: number, total: number) {
    return (event: any, type: string, act: Range, added: Range, removed: Range) => {
      this.selectionCache[index] = {
        act: act, added: added, removed: removed
      };
      if (this.accumulateEvents < 0 || (++this.accumulateEvents) === total) {
        this.fillAndSend(type, index);
      }
    };
  }

  private fillAndSend(type: string, trigger: number) {
    const ids = this.idtypes;
    const full = ids.map((id, i) => {
      const entry = this.selectionCache[i];
      if (entry) {
        return entry;
      }
      return {
        act: id.selections(type),
        added: none(),
        removed: none()
      };
    });

    let act = join(full.map((entry) => entry.act));
    let added = join(full.map((entry) => entry.added));
    let removed = join(full.map((entry) => entry.removed));

    this.selectionCache = [];
    this.accumulateEvents = -1; //reset

    this.ids().then((ids: Range) => {
      //filter to the right ids and convert to indices format
      act = ids.indexOf(act);
      added = ids.indexOf(added);
      removed = ids.indexOf(removed);
      if (act.isNone && added.isNone && removed.isNone) {
        return;
      }
      //ensure the right number of dimensions
      fillWithNone(act, ids.ndim);
      fillWithNone(added, ids.ndim);
      fillWithNone(removed, ids.ndim);

      this.fire(ASelectAble.EVENT_SELECT, type, act, added, removed);
      this.fire(`${ASelectAble.EVENT_SELECT}-${type}`, act, added, removed);
    });
  }

  on(events: string|{[key: string]: IEventListener}, handler?: IEventListener) {
    if (typeof events === 'string' && (events === ASelectAble.EVENT_SELECT || events.slice(0, 'select-'.length) === 'select-')) {
      this.numSelectListeners++;
      if (this.numSelectListeners === 1) {
        const idt = this.idtypes;
        if (idt.length === 1) {
          this.selectionListeners.push(this.singleSelectionListener);
          idt[0].on(ASelectAble.EVENT_SELECT, this.singleSelectionListener);
        } else {
          idt.forEach((idtype, i) => {
            const s = this.selectionListener(idtype, i, idt.length);
            this.selectionListeners.push(s);
            idtype.on(ASelectAble.EVENT_SELECT, s);
          });
        }
      }
    }
    return super.on(events, handler);
  }

  off(events: string|{[key: string]: IEventListener}, handler?: IEventListener) {
    if (typeof events === 'string' && (events === ASelectAble.EVENT_SELECT || events.slice(0, 'select-'.length) === 'select-')) {
      this.numSelectListeners--;
      if (this.numSelectListeners === 0) {
        this.idtypes.forEach((idtype, i) => idtype.off(ASelectAble.EVENT_SELECT, this.selectionListeners[i]));
        this.selectionListeners = [];
      }
    }
    return super.off(events, handler);
  }

  selections(type = defaultSelectionType) {
    return this.ids().then((ids: Range) => {
      const r = join(this.idtypes.map((idtype) => idtype.selections(type)));
      return ids.indexRangeOf(r);
    });
  }

  select(range: RangeLike);
  select(range: RangeLike, op: SelectOperation);
  select(type: string, range: RangeLike);
  select(type: string, range: RangeLike, op: SelectOperation);
  select(dim: number, range: RangeLike);
  select(dim: number, range: RangeLike, op: SelectOperation);
  select(dim: number, type: string, range: RangeLike);
  select(dim: number, type: string, range: RangeLike, op: SelectOperation);
  select() {
    const a = Array.from(arguments);
    const dim = (typeof a[0] === 'number') ? +a.shift() : -1,
      type = (typeof a[0] === 'string') ? a.shift() : defaultSelectionType,
      range = parse(a[0]),
      op = asSelectOperation(a[1]);
    return this.selectImpl(range, op, type, dim);
  }

  private selectImpl(range: Range, op = SelectOperation.SET, type: string = defaultSelectionType, dim = -1) {
    return this.ids().then((ids: Range) => {
      const types = this.idtypes;
      if (dim === -1) {
        range = ids.preMultiply(range);
        this.accumulateEvents = 0;
        const r = join(range.split().map((r, i) => types[i].select(type, r, op)));
        if (this.accumulateEvents > 0) { //one event has not been fires, so do it manually
          this.fillAndSend(type, -1);
        }
        while (r.ndim < types.length) {
          r.dim(r.ndim); //create intermediate ones
        }
        return ids.indexRangeOf(r);
      } else {
        //just a single dimension
        ids = ids.split()[dim];
        range = ids.preMultiply(range);
        types[dim].select(type, range, op);
        return ids.indexRangeOf(range);
      }
    });
  }

  /**
   * clear the specific selection (type) and dimension
   */
  clear();
  clear(type: string);
  clear(dim: number);
  clear(dim: number, type: string);
  clear() {
    const a = Array.from(arguments);
    const dim = (typeof a[0] === 'number') ? +a.shift() : -1;
    const type = (typeof a[0] === 'string') ? a[0] : defaultSelectionType;
    return this.selectImpl(none(), SelectOperation.SET, type, dim);
  }
}

export default ASelectAble;
