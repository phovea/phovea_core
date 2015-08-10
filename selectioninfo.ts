/**
 * Created by Samuel Gratzl on 15.12.2014.
 */
import d3 = require('d3');
import events = require('./event');
import idtypes = require('./idtype');
import ranges = require('./range');
import C = require('./main');

export class SelectionIDType {
  private l = (event, type: string, selection: ranges.Range) => {
    this.update(type, selection);
  };
  private $div: d3.Selection<any>;
  private $ul : d3.Selection<any>;

  constructor(public idType: idtypes.IDType, parent: d3.Selection<any>, private options : any = {}) {
    this.options = C.mixin({
    }, options);
    idType.on('select', this.l);
    this.$div = parent.append('div');
    this.$div.append('span').text(idType.name).style('cursor','pointer').attr('title','click to clear selection');
    if (this.options.addClear) {
      this.$div.select('span').on('click', () => {
        this.options.selectionTypes.forEach((s) => idType.clear(s));
      });
    }
    this.$ul = this.$div.append('ul');

    this.options.selectionTypes.forEach((s) => this.update(s, idType.selections(s)));
  }

  private update(type: string, selection: ranges.Range) {
    if (!this.options.filterSelectionTypes(type)) {
      return;
    }

    this.$div.classed('no-selection-' + type, selection.isNone);
    if (selection.isNone) {
      this.$ul.selectAll('li.select-'+type).remove();
      return;
    }
    var $li = this.$ul.selectAll('li.select-'+type).data(selection.dim(0).asList());
    $li.enter().append('li').classed('select-' + type, true);
    $li.exit().remove();
    $li.text(C.identity);
  }

  destroy() {
    this.idType.off('select', this.l);
  }
}

/**
 * selection info shows a div for each id type and a list of all selected ids in it
 */
export class SelectionInfo {
  private $div : d3.Selection<any>;
  private handler : SelectionIDType[] = [];
  private listener = (event, idtype) => {
    this.handler.push(new SelectionIDType(idtype, this.$div, this.options));
  };

  constructor(public parent:HTMLElement, private options = {}) {
    this.options = C.mixin({
      addClear : true,
      selectionTypes: [ idtypes.defaultSelectionType, idtypes.hoverSelectionType],
      filterSelectionTypes : C.constantTrue
    }, options);
    this.build(d3.select(parent));
  }


  private build(parent:d3.Selection<any>) {
    var $div = this.$div = parent.append('div').classed('selectioninfo', true);
    C.onDOMNodeRemoved(<Element>$div.node(), this.destroy, this);

    events.on('register.idtype', this.listener);
    idtypes.list().forEach((d) => {
      this.listener(null, d);
    });
  }

  private destroy() {
    events.off('register.idtype', this.listener);
    this.handler.forEach((h) => h.destroy());
    this.handler.length = 0;
  }
}

export function createFor(idtype: idtypes.IDType, parent, options) {
  return new SelectionIDType(idtype, d3.select(parent), options);
}

export function create(parent, options) {
  return new SelectionInfo(parent, options);
}
