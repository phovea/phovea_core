/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import C = require('./main');
import ajax = require('./ajax');
import events = require('./event');
import ranges = require('./range');
'use strict';


var cache = {}, filledUp = false;

 export var defaultSelectionType = 'selected';
export var hoverSelectionType = 'hovered';

export enum SelectOperation {
  SET, ADD, REMOVE
}

/**
 * converts the given mouse event to a select operation
 * @param event the mouse event to examine
 */
export function toSelectOperation(event: any);
/**
 * converts the given key modifiers to select operation
 * @param ctryKey
 * @param altKey
 * @param shiftKey
 * @param metaKey
 */
export function toSelectOperation(ctryKey: boolean, altKey: boolean, shiftKey: boolean, metaKey: boolean);
export function toSelectOperation(event: any) {
  var ctryKeyDown, shiftDown, altDown, metaDown;
  if (typeof event === 'boolean') {
    ctryKeyDown = event;
    altDown = arguments[1] || false;
    shiftDown = arguments[2] || false;
    metaDown = arguments[3] || false;
  } else {
    ctryKeyDown = event.ctrlKey || false;
    altDown = event.altKey || false;
    shiftDown = event.shiftKey || false;
    metaDown = event.metaKey || false;
  }
  if (ctryKeyDown || shiftDown) {
    return SelectOperation.ADD;
  } else if (altDown || metaDown) {
    return SelectOperation.REMOVE;
  }
  return SelectOperation.SET;
}

/**
 * an id type is a semantic aggregation of ids, like patient, gene, ...
 */
export class IDType extends events.EventHandler implements C.IPersistable {
  /**
   * the current selections
   * @type {{}}
   */
  private sel = {};

  /**
   *
   * @param name the name of this idtype
   * @param names the plural name
   */
  constructor(public id: string, public name:string, public names:string, public internal = false) {
    super();
  }

  persist() {
    var s = {};
    Object.keys(this.sel).forEach((type) => s[type] = this.sel[type].toString());
    return {
      sel: s,
      name: this.name,
      names: this.names
    };
  }

  restore(persisted: any) {
    this.name = persisted.name;
    this.names = persisted.names;
    Object.keys(persisted.sel).forEach((type) => this.sel[type] = ranges.parse(persisted.sel[type]));
    return null;
  }

  toString() {
    return this.name;
  }

  selectionTypes() {
    return Object.keys(this.sel);
  }

  /**
   * return the current selections of the given type
   * @param type optional the selection type
   * @returns {ranges.Range}
   */
  selections(type = defaultSelectionType) {
    if (this.sel.hasOwnProperty(type)) {
      return this.sel[type];
    }
    return this.sel[type] = ranges.none();
  }

  /**
   * select the given range as
   * @param range
   */
  select(range:ranges.Range);
  select(range:ranges.Range, op:SelectOperation);
  select(range:number[]);
  select(range:number[], op:SelectOperation);
  select(type:string, range:ranges.Range);
  select(type:string, range:ranges.Range, op:SelectOperation);
  select(type:string, range:number[]);
  select(type:string, range:number[], op:SelectOperation);
  select(r_or_t:any, r_or_op ?:any, op = SelectOperation.SET) {
    function asRange(v:any) {
      if (Array.isArray(v)) {
        return ranges.list(v);
      }
      return v;
    }

    var type = (typeof r_or_t === 'string') ? r_or_t.toString() : defaultSelectionType;
    var range = asRange((typeof r_or_t === 'string') ? r_or_op : r_or_t);
    op = (typeof r_or_t === 'string') ? op : (r_or_op ? r_or_op : SelectOperation.SET);
    return this.selectImpl(range, op, type);
  }

  private selectImpl(range:ranges.Range, op = SelectOperation.SET, type:string = defaultSelectionType) {
    var b = this.selections(type);
    var new_:ranges.Range = ranges.none();
    switch (op) {
      case SelectOperation.SET:
        new_ = range;
        break;
      case SelectOperation.ADD:
        new_ = b.union(range);
        break;
      case SelectOperation.REMOVE:
        new_ = b.without(range);
        break;
    }
    if (b.eq(new_)) {
      return b;
    }
    this.sel[type] = new_;
    var added = op !== SelectOperation.REMOVE ? range : ranges.none();
    var removed = (op === SelectOperation.ADD ? ranges.none() : (op === SelectOperation.SET ? b : range));
    this.fire('select', type, new_, added, removed, b);
    this.fire('select-' + type, new_, added, removed, b);
    return b;
  }

  clear(type = defaultSelectionType) {
    return this.selectImpl(ranges.none(), SelectOperation.SET, type);
  }
}

export interface IHasUniqueId {
  id: number;
}

export function toId(elem : IHasUniqueId) {
  return elem.id;
}

export function isId(id: number) {
  return (elem: IHasUniqueId) => elem && elem.id === id;
}

/**
 * a manager of a bunch of objects with selection support
 */
export class ObjectManager<T extends IHasUniqueId> extends IDType {
  private instances: T[] = [];
  private pool = new C.IdPool();

  constructor(id: string, name : string) {
    super(id, name, name + 's', true);
  }

  nextId(item?: T) {
    var n = this.pool.checkOut();
    if (item) {
      item.id = n;
      this.instances[n] = item;
      this.fire('add', n, item);
    }
    return n;
  }

  push(...items : T[]) {
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
    return this.instances.filter((item, i) => this.pool.isCheckedOut(i));
  }

  remove(id: number);
  remove(item: T);
  remove(item: any): T {
    var old = null;
    if (typeof item.id === 'number') {
      item = item.id;
    }
    if (typeof item === 'number') {
      old = this.instances[item];
      delete this.instances[item];
      this.fire('remove', item, old);
    }
    //clear from selections
    this.selectionTypes().forEach((type) => {
      this.select(type, [item], SelectOperation.REMOVE);
    });
    this.pool.checkIn(item);
    return old;
  }

  selectedObjects(type = defaultSelectionType) {
    var s = this.selections(type);
    return s.filter(this.instances);
  }
}

function asRange(v:any) {
  if (Array.isArray(v)) {
    return ranges.list.apply(ranges, v);
  }
  return v;
}

function asSelectOperation(v: any) {
  if (!v) {
    return SelectOperation.SET;
  }
  if(typeof v === 'string') {
    switch(v.toLowerCase()) {
      case 'add' : return SelectOperation.ADD;
      case 'remove' : return SelectOperation.REMOVE;
      default : return SelectOperation.SET;
    }
  }
  return +v;
}


export class SelectAble extends events.EventHandler {
  private numSelectListeners = 0;
  private selectionListeners = [];
  private singleSelectionListener = (event:any, type:string, act:ranges.Range, added:ranges.Range, removed:ranges.Range) => {
    this.ids().then((ids:ranges.Range) => {
      //filter to the right ids and convert to indices format
      //given all ids convert the selected ids to the indices in the data type
      act = ids.indexOf(act);
      added = ids.indexOf(added);
      removed = ids.indexOf(removed);
      if (act.isNone && added.isNone && removed.isNone) {
        return;
      }
      this.fire('select', type, act, added, removed);
      this.fire('select-' + type, act, added, removed);
    });
  };
  private selectionCache = [];
  private accumulateEvents = -1;

  ids(range?:ranges.Range) : Promise<ranges.Range> {
    throw new Error('not implemented');
  }

  get idtypes() : IDType[] {
    throw new Error('not implemented');
  }

  private selectionListener(idtype: IDType, index: number, total : number) {
    var selectionListener = (event: any, type: string, act: ranges.Range, added: ranges.Range, removed: ranges.Range) => {
      this.selectionCache[index] = {
        act: act, added: added, removed: removed
      };
      if (this.accumulateEvents < 0 || (++this.accumulateEvents) === total) {
        this.fillAndSend(type, index);
      }
    };
    return selectionListener;
  }

  private fillAndSend(type: string, trigger: number) {
    var ids = this.idtypes;
    var full = ids.map((id, i) => {
      var entry = this.selectionCache[i];
      if (entry) { return entry; }
      return {
        act: id.selections(type),
        added: ranges.none(),
        removed: ranges.none()
      };
    });

    var act = ranges.join(full.map((entry) => entry.act));
    var added = ranges.join(full.map((entry) => entry.added));
    var removed = ranges.join(full.map((entry) => entry.removed));

    this.selectionCache = [];
    this.accumulateEvents = -1; //reset

    this.ids().then((ids: ranges.Range) => {
      //filter to the right ids and convert to indices format
      act = ids.indexOf(act);
      added = ids.indexOf(added);
      removed = ids.indexOf(removed);
      if (act.isNone && added.isNone && removed.isNone) {
        return;
      }
      this.fire('select', type, act, added, removed);
      this.fire('select-' + type, act, added, removed);
    });
  }

  on(events, handler) {
    if (events === 'select' || events.slice(0, 'select-'.length) === 'select-') {
      this.numSelectListeners ++;
      if (this.numSelectListeners === 1) {
        var idt = this.idtypes;
        if (idt.length === 1) {
          this.selectionListeners.push(this.singleSelectionListener);
          idt[0].on('select', this.singleSelectionListener);
        } else {
          idt.forEach((idtype, i) => {
            var s = this.selectionListener(idtype, i, idt.length);
            this.selectionListeners.push(s);
            idtype.on('select',s);
          });
        }
      }
    }
    return super.on(events, handler);
  }

  off(events, handler) {
    if (events === 'select' || events.match('^select-') === 'select-') {
      this.numSelectListeners --;
      if (this.numSelectListeners === 0) {
        this.idtypes.forEach((idtype, i) => idtype.off('select', this.selectionListeners[i]));
        this.selectionListeners = [];
      }
    }
    return super.off(events, handler);
  }

  selections(type = defaultSelectionType) {
    return this.ids().then((ids: ranges.Range) => {
      var r = ranges.join(this.idtypes.map((idtype) => idtype.selections(type)));
      return ids.indexRangeOf(r);
    });
  }

  select(range: ranges.Range);
  select(range: number[]);
  select(range: number[][]);
  select(range: ranges.Range, op : SelectOperation);
  select(range: number[], op : SelectOperation);
  select(range: number[][], op : SelectOperation);
  select(type: string, range: ranges.Range);
  select(type: string, range: number[]);
  select(type: string, range: number[][]);
  select(type: string, range: ranges.Range, op : SelectOperation);
  select(type: string, range: number[], op : SelectOperation);
  select(type: string, range: number[][], op : SelectOperation);
  select(dim: number, range: ranges.Range);
  select(dim: number, range: number[]);
  select(dim: number, range: ranges.Range, op: SelectOperation);
  select(dim: number, range: number[], op: SelectOperation);
  select(dim: number, type: string, range: ranges.Range);
  select(dim: number, type: string, range: number[]);
  select(dim: number, type: string, range: ranges.Range, op: SelectOperation);
  select(dim: number, type: string, range: number[], op: SelectOperation);
  select() {
    var a = C.argList(arguments);
    var dim = (typeof a[0] === 'number') ? +a.shift() : -1,
      type = (typeof a[0] === 'string') ? a.shift() : defaultSelectionType,
      range = asRange(a[0]),
      op = asSelectOperation(a[1]);
    return this.selectImpl(range, op, type, dim);
  }

  private selectImpl(range: ranges.Range, op = SelectOperation.SET, type : string = defaultSelectionType, dim = -1) {
    return this.ids().then((ids: ranges.Range) => {
      var types = this.idtypes;
      if (dim === -1) {
        range = ids.preMultiply(range);
        this.accumulateEvents = 0;
        var r = ranges.join(range.split().map((r, i) => types[i].select(type, r, op)));
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
  clear(type : string);
  clear(dim : number);
  clear(dim: number, type : string);
  clear() {
    var a = C.argList(arguments);
    var dim = (typeof a[0] === 'number') ? +a.shift : -1;
    var type = (typeof a[0] === 'string') ? a[0] : defaultSelectionType;
    return this.selectImpl(ranges.none(), SelectOperation.SET, type, dim);
  }
}

function fillUpData(entries) {
  entries.forEach(function (row) {
    var entry = cache[row.id];
    var new_ = false;
    if (entry) {
      entry.name = row.name;
      entry.names = row.names;
    } else {
      entry = new IDType(row.id, row.name, row.names);
      new_ = true;
    }
    cache[row.id] = entry;
    if (new_) {
      events.fire('register.idtype', entry);
    }
  });
}

function fillUp() {
  if (filledUp) {
    return;
  }
  filledUp = true;
  ajax.getAPIJSON('/idtype').then(function (c) {
    fillUpData(c);
    return cache;
  });
}

export function resolve(id:string):IDType {
  return register(id, new IDType(id, id, id + 's'));
}

/**
 * list all known
 * @returns {{}|HTTPCache|xm.http.HTTPCache|boolean}
 */
export function list() {
  fillUp(); //trigger loading of the meta data
  return Object.keys(cache).map((d) => cache[d]);
}

export function register(id:string, idtype:IDType) {
  fillUp(); //trigger loading of the meta data
  if (cache.hasOwnProperty(id)) {
    return cache[id];
  }
  cache[id] = idtype;
  events.fire('register.idtype', idtype);
  return idtype;
}

export function persist() {
  var r = {};
  Object.keys(cache).forEach((id) => {
    r[id] = cache[id].persist();
  });
  return r;
}

export function restore(persisted: any) {
  Object.keys(persisted).forEach((id) => {
    resolve(id).restore(persisted[id]);
  });
}

export function clearSelection(type = defaultSelectionType) {
  Object.keys(cache).forEach((id) => cache[id].clear(type));
}
