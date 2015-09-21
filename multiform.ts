/**
 * Created by Samuel Gratzl on 27.08.2014.
 */

import C = require('./main');
import vis = require('./vis');
import ranges = require('./range');
import datatypes = require('./datatype');
import geom = require('./geom');

class ProxyMetaData implements vis.IVisMetaData {
  constructor(private proxy : () => vis.IVisMetaData) {

  }

  get scaling() {
    var p = this.proxy();
    return p ? p.scaling : 'free';
  }

  get rotation() {
    const p = this.proxy();
    return p ? p.rotation : 0;
  }

  get sizeDependsOnDataDimension() {
    const p = this.proxy();
    return p ? p.sizeDependsOnDataDimension : [false, false];
  }
}

export interface IMultiForm extends vis.IVisInstance {
  act: vis.IVisPluginDesc;
  visses: vis.IVisPluginDesc[];
  switchTo(id: string)  : Promise<any>;
  switchTo(index: number)  : Promise<any>;
  switchTo(vis:vis.IVisPluginDesc) : Promise<any>;
}


function selectVis(initial: any, visses: vis.IVisPluginDesc[]) {
  switch(typeof initial) {
  case 'number':
    return visses[Math.max(0, Math.min(initial, visses.length - 1))];
  case 'string':
    return visses[Math.max(0, C.indexOf(visses, (v) => v.id === initial))];
  default:
    return visses[Math.max(0, visses.indexOf(initial))];
  }
}

function clearNode(parent: Element) {
  let node = parent.firstChild;
  while( (node = parent.firstChild) != null) {
    parent.removeChild(node);
  }
}

function createNode(parent: Element, type: string = 'div', clazz?: string) {
  let node = document.createElement(type);
  if (clazz) {
    clazz.split(' ').forEach((c) => node.classList.add(c));
  }
  parent.appendChild(node);
  return node;
}

/**
 * a simple multi form class using a select to switch
 */
export class MultiForm extends vis.AVisInstance implements vis.IVisInstance, IMultiForm {
  node: HTMLElement;
  /**
   * list of all possibles vis techniques
   */
  visses:vis.IVisPluginDesc[];

  private actVis:vis.IVisInstance;
  private actVisPromise : Promise<any>;

  private actDesc:vis.IVisPluginDesc;
  private content:HTMLElement;

  private metaData_ : vis.IVisMetaData = new ProxyMetaData(() => this.actDesc);

  constructor(public data:datatypes.IDataType, parent:Element, private options : any = {}) {
    super();
    this.options = C.mixin({
      initialVis : 0,
      all : { //options to all visses

      }
    }, options);
    this.node = createNode(parent, 'div', 'multiform');
    (<any>parent).__data__ = data;
    vis.assignVis(this.node, this);
    //find all suitable plugins
    this.visses = vis.list(data);

    this.build();
  }

  /**
   * converts this multiform to a vis metadata
   * @return {vis.IVisMetaData}
   */
  get asMetaData() {
    return this.metaData_;
  }


  private build() {
    //create select option field

    //create content
    this.content = createNode(this.node, 'div', 'content');
    //switch to first
    this.switchTo(this.options.initialVis);
  }

  destroy() {
    if (this.actVis && C.isFunction(this.actVis.destroy)) {
      this.actVis.destroy();
    }
    super.destroy();
  }

  persist() : any {
    return {
      id: this.actDesc ? this.actDesc.id : null,
      content: this.actVis && C.isFunction(this.actVis.persist) ? this.actVis.persist() : null
    };
  }

  restore(persisted: any): Promise<MultiForm> {
    const that = this;
    if (persisted.id) {
      const selected = C.search(this.visses, (e) => e.id === persisted.id);
      if (selected) {
        return this.switchTo(selected).then((vis) => {
          if (vis && persisted.content && C.isFunction(vis.restore)) {
            return Promise.resolve(vis.restore(persisted.content)).then(() => that);
          }
          return that;
        });
      }
    }
    return Promise.resolve(that);
  }

  locate(...args) {
    const p = this.actVisPromise || Promise.resolve(null);
    return p.then((...aa) => {
      const vis = aa.length > 0 ? aa[0] : undefined;
      if (vis && C.isFunction(vis.locate)) {
        return vis.locate.apply(vis, args);
      } else {
        return Promise.resolve((aa.length === 1 ? undefined : new Array(args.length)));
      }
    });
  }

  locateById(...args) {
    const p = this.actVisPromise || Promise.resolve(null);
    return p.then((...aa) => {
      const vis = aa.length > 0 ? aa[0] : undefined;
      if (vis && C.isFunction(vis.locateById)) {
        return vis.locateById.apply(vis, args);
      } else {
        return Promise.resolve((aa.length === 1 ? undefined : new Array(args.length)));
      }
    });
  }

  transform(scale?: number[], rotate? : number) {
    if (this.actVis) {
      if (arguments.length === 0) {
        return this.actVis.transform();
      } else {
        const t = (event, new_, old) => {
          this.fire('transform', new_, old);
        };
        this.actVis.on('transform', t);
        const r = this.actVis.transform(scale, rotate);
        this.actVis.off('transform', t);
        return r;
      }
    }
    return {
      scale: [1,1],
      rotate: 0
    };
  }

  /**
   * returns the current selected vis technique description
   * @returns {plugins.IPluginDesc}
   */
  get act() {
    return this.actDesc;
  }

  Loader() {
    return this.actVisPromise;
  }

  get size() : [number, number] {
    if (this.actVis) {
      return this.actVis.size;
    }
    return [100, 100];
  }

  get rawSize(): [number, number] {
    if (this.actVis) {
      return this.actVis.rawSize;
    }
    return [100, 100];
  }

  /**
   * switch to the desired vis technique given by index
   * @param index
   */
  switchTo(index: number)  : Promise<any>;
  switchTo(vis:vis.IVisPluginDesc) : Promise<any>;
  switchTo(id: string) : Promise<any>;
  switchTo(param : any) : Promise<any> {
    const vis: vis.IVisPluginDesc = selectVis(param, this.visses);

    if (vis === this.actDesc) {
      return this.actVisPromise; //already selected
    }
    //gracefully destroy
    if (this.actVis) {
      this.actVis.destroy();
      this.actVis = null;
      this.actVisPromise = null;
    }
    //remove content dom side
    clearNode(this.content);

    //switch and trigger event
    const bak = this.actDesc;
    this.actDesc = vis;
    this.markReady(false);
    this.fire('change', vis, bak);
    this.actVis = null;
    this.actVisPromise = null;

    if (vis) {
      //load the plugin and create the instance
      return this.actVisPromise = vis.load().then((plugin:any) => {
        if (this.actDesc !== vis) { //changed in the meanwhile
          return null;
        }
        this.actVis = plugin.factory(this.data, this.content, C.mixin({}, this.options.all, this.options[vis.id] || {}));
        this.actVis.on('ready', () => this.markReady());
        this.fire('changed', vis, bak);
        return this.actVis;
      });
    } else {
      return Promise.resolve(null);
    }
  }
}

class GridElem implements C.IPersistable {
  private actVis : vis.IVisInstance;
  content : HTMLElement;

  constructor(public range: ranges.Range, public pos : number[], public data: datatypes.IDataType) {
  }

  setContent(c : HTMLElement) {
    this.content = c;
    (<any>this.content).__data__ = this.data;
  }

  subrange(r : ranges.Range) {
    var ri = this.range.intersect(r);
    return this.range.indexOf(ri);
  }

  get hasOne() {
    return this.actVis != null;
  }

  destroy() {
    if (this.actVis && C.isFunction(this.actVis.destroy)) {
      this.actVis.destroy();
    }
  }

  get size(): number[] {
    return this.actVis ? this.actVis.size : [100, 100];
  }

  get rawSize(): number[] {
    return this.actVis ? this.actVis.rawSize : [100, 100];
  }

  persist() {
    return {
      range: this.range.toString(),
      content: this.actVis && C.isFunction(this.actVis.persist) ? this.actVis.persist() : null
    };
  }

  restore(persisted: any) {
    //FIXME
    /*if (persisted.id) {
      var selected = C.search(this.visses, (e) => e.id === persisted.id);
      if (selected) {
        this.switchTo(selected).then((vis) => {
          if (vis && persisted.content && C.isFunction(vis.restore)) {
            vis.restore(persisted.content);
          }
        });
      }
    }*/
    return null;
  }

  switchDestroy() {
    //remove content dom side
    clearNode(this.content);
    if (this.actVis && C.isFunction(this.actVis.destroy)) {
      this.actVis.destroy();
    }
    this.actVis = null;
  }

  build(plugin: any) {
    this.actVis = plugin.factory(this.data, this.content);
    vis.assignVis(this.content, this.actVis);
    return this.actVis;
  }

  get location() {
    const offset = C.offset(this.content);
    return {
      x : offset.left,
      y : offset.top
    };
  }


  transform(scale?: number[], rotate? : number) {
    if (this.actVis) {
      if (arguments.length > 0) {
        return this.actVis.transform(scale, rotate);
      } else {
        return this.actVis.transform();
      }
    }
    return {
      scale: [1,1],
      rotate: 0
    };
  }
}

function sum(arr: number[]) {
  return arr.reduce((v,x) => v+x, 0);
}

function max(arr: any[], acc: (row: any) => number) {
  if (arr.length === 0) {
    return NaN;
  }
  return arr.reduce((p,act) => Math.max(p,acc(act)), -Infinity);
}

/**
 * a simple multi form class using a select to switch
 */
export class MultiFormGrid extends vis.AVisInstance implements vis.IVisInstance, IMultiForm {
  node: HTMLElement;
  /**
   * list of all possibles vis techniques
   */
  visses:vis.IVisPluginDesc[];

  private actDesc:vis.IVisPluginDesc;

  private actVisPromise : Promise<any>;

  private content:HTMLElement;

  private dims : ranges.Range1DGroup[][];
  private grid : GridElem[];

  private metaData_ : vis.IVisMetaData = new ProxyMetaData(() => this.actDesc);

  constructor(public data:datatypes.IDataType, public range: ranges.Range, parent:Element, viewFactory : (data:datatypes.IDataType, range : ranges.Range) => datatypes.IDataType, private options : any = {}) {
    super();
    this.options = C.mixin({
      initialVis : 0
    }, options);
    this.node = createNode(parent, 'div', 'multiformgrid');
    (<any>parent).__data__ = data;
    vis.assignVis(this.node, this);
    //find all suitable plugins
    this.visses = vis.list(data);

    //compute the dimensions and build the grid
    const dims = this.dims = range.dims.map((dim) => {
      if (dim instanceof ranges.CompositeRange1D) {
        return (<ranges.CompositeRange1D>dim).groups;
      } else if (dim instanceof ranges.Range1DGroup) {
        return [ <ranges.Range1DGroup>dim ];
      } else {
        return [ ranges.asUngrouped(dim) ];
      }
    });
    const grid = this.grid = [];
    function product(level: number, range : ranges.Range1D[], pos : number[]) {
      if (level === dims.length) {
        var r = range.length === 0 ? ranges.all() : ranges.list(range.slice()); //work on a copy for safety reason
        grid.push(new GridElem(r, pos.slice(), viewFactory(data, r)));
      } else {
        dims[level].forEach((group, i) => {
          range.push(group);
          pos.push(i);
          product(level + 1, range, pos);
          range.pop();
          pos.pop();
        });
      }
    }
    product(0, [], []);

    this.build();
  }

  get dimSizes() {
    return this.dims.map((d) => d.length);
  }

  private toElem(pos: number[]) {
    const s = this.dimSizes;
    if (s.length === 1) {
      return this.grid[pos[0]];
    }
    return this.grid[pos[0] * s[1] + (pos[1]||0)];
  }

  getRange(...indices: number[]) {
    const elem = this.toElem(indices);
    return elem.range;
  }

  getData(...indices: number[]) {
    const elem = this.toElem(indices);
    return elem.data;
  }

  getBounds(...indices : number[]) {
    const elem = this.toElem(indices);
    const absloc = elem.location;
    const size = elem.size;
    const parentLoc = C.offset(this.content);

    return geom.rect(absloc.x - parentLoc.left, absloc.y - parentLoc.top, size[0], size[1]);
  }

  /**
   * converts this multiform to a vis metadata
   * @return {vis.IVisMetaData}
   */
  get asMetaData() {
    return this.metaData_;
  }

  private build() {
    //create select option field

    //create content
    this.content = this.node;
    const wrap = this.options.wrap || C.identity;
    //create groups for all grid elems
    //TODO how to layout as a grid
    if (this.dims.length === 1) {
      this.grid.forEach((elem) => elem.setContent(wrap(createNode(this.node, 'div', 'content gridrow'), elem.data, elem.range)));
    } else {
      const ndim = this.dimSizes;
      for(let i = 0; i < ndim[0]; ++i) {
        let row = createNode(this.node, 'div', 'gridrow');
        for(let j = 0; j < ndim[1]; ++j) {
          const elem = this.grid[i*ndim[1] + j];
          let nn = createNode(row, 'div', 'content');
          nn.style.display = 'inline-block';
          elem.setContent(wrap(nn, elem.data, elem.range));
        }
      }
    }
    //switch to first
    this.switchTo(<any>this.options.initialVis);
  }

  destroy() {
    this.grid.forEach((elem) => {
      elem.destroy();
    });
    super.destroy();
  }

  transform(scale?: number[], rotate? : number) {
    if (this.grid[0].hasOne) {
      const bak = this.grid[0].transform();
      if (arguments.length > 0) {
        this.grid.forEach((g) => g.transform(scale, rotate));
        this.fire('transform', {
          scale: scale,
          rotate: rotate
        }, bak);
      }
      return bak;
    }
    return {
      scale: [1,1],
      rotate: 0
    };
  }

  persist() : any {
    return {
      id: this.actDesc ? this.actDesc.id : null,
      contents: this.grid.map((elem) => elem.persist())
    };
  }

  restore(persisted: any): Promise<MultiFormGrid> {
    const that = this;
    if (persisted.id) {
      const selected = C.search(this.visses, (e) => e.id === persisted.id);
      if (selected) {
        return this.switchTo(selected).then((vis) => {
          //FIXME
          if (vis && persisted.content && C.isFunction(vis.restore)) {
            return Promise.resolve(vis.restore(persisted.content)).then(() => that);
          }
          return Promise.resolve(that);
        });
      }
    }
    return Promise.resolve(that);
  }


  private locateGroup(range:ranges.Range) {
    if (range.isAll || range.isNone) {
      const s = this.size;
      return Promise.resolve(geom.rect(0,0,s[0], s[1]));
    }
    const parentLoc = C.offset(this.content);
    function relativePos(pos) {
      return {
        x : pos.x - parentLoc.left,
        y : pos.y - parentLoc.top
      };
    }
    function filterTo() {
      var inElems = [], i : number, matched, g : GridElem;

      for (i = 0; i < this.grid.length; ++i) {
        g = this.grid[i];
        matched = g.subrange(range);

        if (!matched.isNone) { //direct group hit
          inElems.push({
            g: g,
            pos: relativePos(g.location),
            r : matched
          });
        }
      }
      return inElems;
    }
    var inElems = filterTo.call(this);

    if (inElems.length === 1) {
      return inElems[0].g.actVis.locate(inElems[0].r).then((loc) => {
        return loc ? loc.shift(inElems[0].pos) : loc;
      });
    }
    return Promise.all(inElems.map((elem) => elem.g.actVis.locate(elem.r))).then((locations: geom.AShape[]) => {
      //shift the locations according to grid position
      locations = locations.map((loc, i) => loc ? loc.shift(inElems[i].pos) : loc).filter((loc) => loc != null);
      //merge into a single one
      var base = locations[0].aabb(),
        x = base.x, y = base.y, x2 = base.x2, y2 = base.y2;
      locations.forEach((loc) => {
        var aab = loc.aabb();
        x = Math.min(x, aab.x);
        y = Math.min(y, aab.y);
        x2 = Math.min(x2, aab.x2);
        y2 = Math.min(y2, aab.y2);
      });
      return geom.rect(x, y, x2-x , y2-y);
    });
  }

  locateGroupById(range:ranges.Range) {
    return this.data.ids().then((ids) => {
      return this.locateGroup(ids.indexOf(range));
    });
  }

  locate() {
    const p = this.actVisPromise || Promise.resolve(null), args = C.argList(arguments);
    return p.then(function (visses) {
      if (!visses) {
        return Promise.resolve((arguments.length === 1 ? undefined : new Array(args.length)));
      }
      if (visses.length === 1) {
        return visses[0].locate.apply(visses[0], args);
      } else {
        //multiple groups
        if (arguments.length === 1) {
          return this.locateGroup(arguments[0]);
        } else {
          return Promise.all(args.map((arg) => this.locateGroup(arg)));
        }
      }
    });
  }

  locateById(...range:ranges.Range[]) {
    const p = this.actVisPromise || Promise.resolve(null), args = C.argList(arguments);
    return p.then(function (visses) {
      if (!visses) {
        return Promise.resolve((arguments.length === 1 ? undefined : new Array(args.length)));
      }
      if (visses.length === 1) {
        return visses[0].locateById.apply(visses[0], args);
      } else {
        //multiple groups
        if (args.length === 1) {
          return this.locateGroupById(args[0]);
        } else {
          return Promise.all(args.map((arg) => this.locateGroupById(arg)));
        }
      }
    });
  }

  /**
   * returns the current selected vis technique description
   * @returns {plugins.IPluginDesc}
   */
  get act() {
    return this.actDesc;
  }

  get actLoader() {
    return this.actVisPromise;
  }



  gridSize(raw = false) : { cols: number[]; rows: number[]; grid: number[][][]} {
    const sizes = this.grid.map(raw ? (elem) => elem.rawSize : (elem) => elem.size);

    if (this.dims.length === 1) {
      //vertically groups only
      return {
        cols: [ <number>max(sizes, (s) => s[0]) ],
        rows: sizes.map((s) => s[1]),
        grid: sizes.map((s) => [s])
      };
    } else { //if (this.dims.length === 2)
      const cols = this.dims[1].length;
      const grid = this.dims[0].map((row, i) => sizes.slice(i * cols, (i + 1) * cols));
      return {
        cols: this.dims[1].map((d, i) => <number>max(grid, (row) => row[i][0])),
        rows: grid.map((row) => <number>max(row, (s) => s[1])),
        grid: grid
      };
    }
  }

  get size() : [number, number] {
    const gridSize = this.gridSize();
    return [ sum(gridSize.cols), sum(gridSize.rows)];
  }

  get rawSize() : [number, number] {
    const gridSize = this.gridSize(true);
    return [ sum(gridSize.cols), sum(gridSize.rows)];
  }

  /**
   * switch to the desired vis technique given by index
   * @param index
   */
  switchTo(index: number)  : Promise<any>;
  switchTo(vis:vis.IVisPluginDesc) : Promise<any>;
  switchTo(id: string) : Promise<any>;
  switchTo(param : any) : Promise<any> {
    const vis: vis.IVisPluginDesc = selectVis(param, this.visses);

    if (vis === this.actDesc) {
      return this.actVisPromise; //already selected
    }

    //gracefully destroy
    this.grid.forEach((elem) => elem.switchDestroy());

    //switch and trigger event
    const bak = this.actDesc;
    this.actDesc = vis;
    this.markReady(false);
    this.fire('change', vis, bak);
    this.actVisPromise = null;

    if (vis) {
      //load the plugin and create the instance
      return this.actVisPromise = vis.load().then((plugin:any) => {
        if (this.actDesc !== vis) { //changed in the meanwhile
          return null;
        }
        const r = this.grid.map((elem) => {
          return elem.build(plugin);
        });
        var c = r.length;
        r.forEach((ri) => {
          ri.on('ready', () => {
            c--;
            if (c === 0) { //all built
              this.markReady();
            }
          });
        });
        this.fire('changed', vis, bak);
        return r;
      });
    } else {
      return Promise.resolve([]);
    }
  }
}

/**
 * computes the selectable vis techniques for a given set of multi form objects
 * @param forms
 * @return {*}
 */
export function toAvailableVisses(forms: IMultiForm[]) {
  if (forms.length === 0) {
    return [];
  } if (forms.length === 1) {
    return forms[0].visses;
  }
  //intersection of all
  return forms[0].visses.filter((vis) => forms.every((f) => f.visses.indexOf(vis) >= 0));
}

export function addIconVisChooser(toolbar: Element, ...forms: IMultiForm[]) {
  const s = document.createElement('div');
  toolbar.insertBefore(s, toolbar.firstChild);
  const visses = toAvailableVisses(forms);

  visses.forEach((v) => {
    let child = createNode(s, 'i');
    v.iconify(child);
    (<any>child).__data__ = v;
    child.onclick = () => forms.forEach((f) => f.switchTo(v));
  });
}

export function addSelectVisChooser(toolbar: Element, ...forms: IMultiForm[]) {
  const s = <HTMLSelectElement>document.createElement('select');
  toolbar.insertBefore(s, toolbar.firstChild);
  const visses = toAvailableVisses(forms);

  visses.forEach((v, i) => {
    let child = createNode(s, 'option');
    (<any>child).__data__ = v;
    child.setAttribute('value', String(i));
    child.textContent = v.name;
  });
  s.onchange = () => forms.forEach((f) => f.switchTo(visses[s.selectedIndex]));
}

export function create(data:datatypes.IDataType, parent:Element, options?) {
  return new MultiForm(data, parent, options);
}

export function createGrid(data:datatypes.IDataType, range: ranges.Range, parent:Element, viewFactory : (data:datatypes.IDataType, range : ranges.Range) => datatypes.IDataType, options?) {
  return new MultiFormGrid(data, range, parent, viewFactory, options);
}
