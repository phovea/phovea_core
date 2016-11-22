import {argFilter, argSort, bounds, mod, version, uniqueId} from '../src';

describe('argFilter', () => {
  it('evens', () => expect(argFilter([1, 3, 5, 2, 4, 6, 7, 9, 11], (d) => d % 2 === 0))
      .toEqual([3, 4, 5]));
});

describe('argSort', () => {
  it('length', () => expect(argSort(['lizard', 'marsupial', 'cat', 'dolphin'], (a, b) => a.length - b.length))
      .toEqual([2, 0, 3, 1])
  );
});

describe('mod', () => {
  it('+ % +', () => expect(mod(101, 5)).toEqual(1));
  it('- % + (native)', () => expect(-101 % 5).toEqual(-1));
  it('- % +', () => expect(mod(-101, 5)).toEqual(4));
  it('+ % -', () => expect(mod(101, -5)).toEqual(-4));
  it('- % -', () => expect(mod(-101, -5)).toEqual(-1));
});

describe('bounds', () => {
  /* TODO: This seems odd. For instance, there is already an x and y provided by the DOM,
  but we give a different meaning to these.  */
  it('not a DOM object', () => expect(bounds(null)).toEqual({ x: 0, y: 0, w: 0, h: 0 }));
  // TODO: DOM object
});

it('version', () => expect(version).toEqual('__VERSION__') );
// TODO: (1) Doesn't seem right. (2) Does anything actually need it?

describe('uniqueId', () => {
  it('first time', () => expect(uniqueId()).toEqual(0));
  it('second time', () => expect(uniqueId()).toEqual(1));
});
    
    // TODO: IdPool is limited to core... make private?
    // TODO: _init is limited to core... make private?
    // TODO: argFilter is limited to core... make private?

    //  argList external usages:
    //  caleydo_window/main.ts:        return vis.locate.apply(vis, C.argList(arguments)).then(function (r) {
    //  caleydo_window/main.ts:        return vis.locateById.apply(vis, C.argList(arguments)).then(function (r) {

    // TODO: argSort is limited to core... make private?
    // TODO: callable is defined but unused... delete?

     // constantFalse external usages:
     // caleydo_d3/link.ts:    canHover: C.constantFalse

     // constantTrue external usages:
     // caleydo_clue/selection.ts:      filter: C.constantTrue,
     // caleydo_d3/databrowser.ts:      filter: C.constantTrue
     // caleydo_d3/link.ts:      filter = this.options.filter || C.constantTrue;
     // caleydo_d3/link.ts:    filter: C.constantTrue,
     // caleydo_d3/link.ts:    idTypeFilter : <(idtype: idtypes.IDType, i: number, dataVis: IDataVis) => boolean>C.constantTrue,
     // caleydo_d3/link.ts:    canSelect : C.constantTrue,
     // caleydo_d3/selectioninfo.ts:    filterSelectionTypes : <(selectionType: string) => boolean>C.constantTrue
     // caleydo_d3/selectioninfo.ts:    filterSelectionTypes : <(selectionType: string) => boolean>C.constantTrue,
     // caleydo_d3/selectioninfo.ts:    filter : <(idtype: idtypes.IDType) => boolean>C.constantTrue

    // TODO: copyDnD is limited to core... make private?
    // TODO: delayedCall is defined but unused... delete?

     // extendClass external usages:
     // caleydo_d3/d3util.ts:  C.extendClass(VisTechnique, vis.AVisInstance);
     // fix_id external usages:
     // caleydo_importer/importtable.ts:    id: fix_id(common.name+random_id(2)),
     // caleydo_importer/importtable.ts:    id: fix_id(common.name+random_id(3)),

    // TODO: flagId is limited to core... make private?

     // isFunction external usages:
     // caleydo_clue/multiform.ts:  if (C.isFunction((<any>m).switchTo)) {
     // caleydo_d3/d3util.ts:    if (C.isFunction(this.init)) {
     // caleydo_window/main.ts:    if (C.isFunction(vis_or_factory)) {
     // caleydo_window/main.ts:        if (!C.isFunction(vis.locate)) {
     // caleydo_window/main.ts:        if (!C.isFunction(vis.locateById)) {

    // TODO: isUndefined is defined but unused... delete?
    // TODO: noop is limited to core... make private?

     // offline external usages:
     // caleydo_security_flask/login.ts:  if (!C.offline) {
     // caleydo_security_flask/login.ts:  if (!C.offline) {

    // TODO: server_json_suffix is limited to core... make private?
    // TODO: server_url is limited to core... make private?
    // TODO: uniqueId is limited to core... make private?

     // uniqueString external usages:
     // caleydo_d3/parser.ts:    const id = C.uniqueString('localData');
     // caleydo_d3/parser.ts:    const id = C.uniqueString('localData');
     // caleydo_d3/parser.ts:    const id = C.uniqueString('localData');

    // TODO: version is defined but unused... delete?
