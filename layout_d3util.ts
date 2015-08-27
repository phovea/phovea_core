/**
 * Created by sam on 04.02.2015.
 */
/// <reference path="../../tsd.d.ts" />

import d3 = require('d3');
import layout = require('./layout');
import C = require('./main');
import geom = require('./geom');
'use strict';

class SVGTransformLayoutElem extends layout.ALayoutElem implements layout.ILayoutElem {
  constructor(private $elem: d3.Selection<any>, private rawWidth: number, private rawHeight: number, options:any = {}) {
    super(options);
  }

  setBounds(x:number, y:number, w:number, h:number) {
    var t = d3.transform(this.$elem.attr('transform'));
    t.translate[0] = x;
    t.translate[1] = y;
    t.scale[0] = w / this.rawWidth;
    t.scale[1] = h / this.rawHeight;
    this.$elem.attr('transform', t.toString());
    return null;
  }

  getBounds() {
    var t = d3.transform(this.$elem.attr('transform'));
    return geom.rect(t.translate[0], t.translate[1], this.rawWidth * t.scale[0], this.rawHeight * t.scale[1]);
  }
}

class SVGRectLayoutElem extends layout.ALayoutElem implements layout.ILayoutElem {
  constructor(private $elem: d3.Selection<any>, options:any = {}) {
    super(options);
  }

  setBounds(x:number, y:number, w:number, h:number) {
    this.$elem.attr({
      x : x,
      y: y,
      width: w,
      height: h
    });
    return null;
  }

  getBounds() {
    return geom.rect(parseFloat(this.$elem.attr('x')), parseFloat(this.$elem.attr('y')), parseFloat(this.$elem.attr('width')), parseFloat(this.$elem.attr('height')));
  }
}


class HTMLLayoutElem extends layout.ALayoutElem implements layout.ILayoutElem {
  private $node : d3.Selection<any>;
  private targetBounds : geom.Rect = null;

  constructor(node:HTMLElement, options:any = {}) {
    super(options);
    this.$node = d3.select(node);
  }

  setBounds(x:number, y:number, w:number, h:number) {
    var unit = this.layoutOption('unit', 'px'),
      doAnimate = this.layoutOption('animate', false) === true;
    var t : any = doAnimate ? this.$node.transition().duration(this.layoutOption('animation-duration',200)) : this.$node;
    t.style({
      left : x + unit,
      top : y + unit,
      width: w + unit,
      height: h + unit
    });
    var extra = this.layoutOption('set-call',null);
    if (extra) {
      t.call(extra);
    }
    extra = this.layoutOption('onSetBounds', null);
    if (doAnimate) {
      this.targetBounds =  geom.rect(x,y,w,h);
      var d : Promise<void> = new Promise<void>((resolve) => {
        t.each('end', () => {
          this.targetBounds = null;
          if (extra) {
            extra();
          }
          resolve(null);
        });
      });
      return d;
    } else if (extra) {
      extra();
      return Promise.resolve(null);
    }
  }

  getBounds() {
    if (this.targetBounds) { //in an animation
      return this.targetBounds;
    }
    var unit = this.layoutOption('unit', 'px'),
      style = (<HTMLElement>this.$node.node()).style;
    function v(f: string) {
      if (f.length >= unit.length && f.substring(f.length-unit.length) === unit) {
        f = f.substring(0, f.length-unit.length);
        return parseFloat(f);
      }
      return 0;
    }
    return geom.rect(v(style.left),v(style.top), v(style.width),v(style.height));
  }
}

export function wrapSVGTransform($elem: d3.Selection<any>, rawWidth: number, rawHeight: number, options:any = {}) {
  return new SVGTransformLayoutElem($elem, rawWidth, rawHeight, options);
}
export function wrapSVGRect($elem: d3.Selection<any>, options:any = {}) {
  return new SVGRectLayoutElem($elem, options);
}
export function wrapDom(elem: HTMLElement, options:any = {}) {
  return new HTMLLayoutElem(elem, options);
}
