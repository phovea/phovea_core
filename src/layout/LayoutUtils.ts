/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 15.12.2014.
 */
import {IPadding, ILayoutElem} from './layout';

export class LayoutUtils {

  static padding(v: number): IPadding {
    return {top: v, left: v, right: v, bottom: v};
  }

  public static noPadding = LayoutUtils.padding(0);

  static flowLayout(horizontal: boolean, gap: number, padding = {top: 0, left: 0, right: 0, bottom: 0}) {
    function getSize(w: number, h: number, child: ILayoutElem, value: number) {
      if (horizontal) {
        return [value, LayoutUtils.grab(child.layoutOption('prefHeight', Number.NaN), h)];
      } else {
        return [LayoutUtils.grab(child.layoutOption('prefWidth', Number.NaN), w), value];
      }
    }

    function FlowLayout(elems: ILayoutElem[], w: number, h: number, parent: ILayoutElem) {
      w -= padding.left + padding.right;
      h -= padding.top + padding.bottom;
      const freeSpace = (horizontal ? w : h) - gap * (elems.length - 1);
      let unbound = 0, fixUsed = 0, ratioSum = 0;

      // count statistics
      elems.forEach((elem) => {
        const fix = elem.layoutOption(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
        const ratio = elem.layoutOption('ratio', Number.NaN);
        if (LayoutUtils.isDefault(fix) && LayoutUtils.isDefault(ratio)) {
          unbound++;
        } else if (fix >= 0) {
          fixUsed += fix;
        } else {
          ratioSum += ratio;
        }
      });

      const ratioMax = (ratioSum < 1) ? 1 : ratioSum;
      const unboundedSpace = (freeSpace - fixUsed - freeSpace * ratioSum / ratioMax) / unbound;

      // set all sizes
      const sizes = elems.map((elem) => {
        const fix = elem.layoutOption(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
        const ratio = elem.layoutOption('ratio', Number.NaN);
        if (LayoutUtils.isDefault(fix) && LayoutUtils.isDefault(ratio)) {
          return getSize(w, h, elem, unboundedSpace);
        } else if (fix >= 0) {
          return getSize(w, h, elem, fix);
        } else { // (ratio > 0)
          const value = (ratio / ratioMax) * freeSpace;
          return getSize(w, h, elem, value);
        }
      });
      // set all locations
      let xAccumulator = padding.left;
      let yAccumulator = padding.top;
      const promises: Promise<void>[] = [];
      elems.forEach((elem, i) => {
        const s = sizes[i];
        promises.push(elem.setBounds(xAccumulator, yAccumulator, s[0], s[1]));
        if (horizontal) {
          xAccumulator += s[0] + gap;
        } else {
          yAccumulator += s[1] + gap;
        }
      });
      return LayoutUtils.waitFor(promises);
    }

    return FlowLayout;
  }

  static distributeLayout(horizontal: boolean, defaultValue: number, padding = LayoutUtils.noPadding) {
    function setBounds(x: number, y: number, w: number, h: number, child: ILayoutElem, value: number) {
      if (horizontal) {
        return child.setBounds(x, y, value, LayoutUtils.grab(child.layoutOption('prefHeight', Number.NaN), h));
      } else {
        return child.setBounds(x, y, LayoutUtils.grab(child.layoutOption('prefWidth', Number.NaN), w), value);
      }
    }

    function DistributeLayout(elems: ILayoutElem[], w: number, h: number, parent: ILayoutElem) {
      w -= padding.left + padding.right;
      h -= padding.top + padding.bottom;
      const freeSpace = (horizontal ? w : h);
      let fixUsed = 0;

      // count statistics
      elems.forEach((elem) => {
        let fix = elem.layoutOption(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
        if (LayoutUtils.isDefault(fix)) {
          fix = defaultValue;
        }
        fixUsed += fix;
      });

      const gap = (freeSpace - fixUsed) / (elems.length - 1);

      let xAccumulator = padding.left;
      let yAccumulator = padding.top;

      if (elems.length === 1) { //center the single one
        if (horizontal) {
          xAccumulator += (freeSpace - fixUsed) / 2;
        } else {
          yAccumulator += (freeSpace - fixUsed) / 2;
        }
      }

      const promises: Promise<any>[] = [];
      elems.forEach((elem) => {
        let fix = elem.layoutOption(horizontal ? 'prefWidth' : 'prefHeight', Number.NaN);
        if (LayoutUtils.isDefault(fix)) {
          fix = defaultValue;
        }
        promises.push(setBounds(xAccumulator, yAccumulator, w, h, elem, fix));
        if (horizontal) {
          xAccumulator += fix + gap;
        } else {
          yAccumulator += fix + gap;
        }
      });
      return LayoutUtils.waitFor(promises);
    }

    return DistributeLayout;
  }

  //     top
  //------------
  // l |      | r
  // e |      | i
  // f |center| g
  // t |      | h
  //   |      | t
  //-------------
  //   bottom

  static borderLayout(horizontal: boolean, gap: number, percentages: IPadding = {
    top: 0.2,
    left: 0.2,
    right: 0.2,
    bottom: 0.2
  }, padding: IPadding = LayoutUtils.noPadding) {
    function BorderLayout(elems: ILayoutElem[], w: number, h: number, parent: ILayoutElem) {
      w -= padding.left + padding.right;
      h -= padding.top + padding.bottom;
      let x = padding.top, y = padding.left, wc = w, hc = h;
      const pos = new Map<string, ILayoutElem[]>();
      pos.set('top', []);
      pos.set('center', []);
      pos.set('left', []);
      pos.set('right', []);
      pos.set('bottom', []);
      elems.forEach((elem) => {
        let border = elem.layoutOption('border', 'center');
        if (!pos.has(border)) {
          border = 'center'; //invalid one
        }
        pos.get(border).push(elem);
      });

      const promises = [];
      if (pos.get('top').length > 0) {
        y += h * percentages.top;
        hc -= h * percentages.top;
        promises.push(LayoutUtils.flowLayout(true, gap)(pos.get('top'), w, h * percentages.top, parent));
      }
      if (pos.get('bottom').length > 0) {
        hc -= h * percentages.bottom;
        promises.push(LayoutUtils.flowLayout(true, gap)(pos.get('bottom'), w, h * percentages.bottom, parent));
      }
      if (pos.get('left').length > 0) {
        x += w * percentages.left;
        wc -= w * percentages.left;
        promises.push(LayoutUtils.flowLayout(false, gap)(pos.get('left'), w * percentages.left, hc, parent));
      }
      if (pos.get('right').length > 0) {
        wc -= w * percentages.right;
        promises.push(LayoutUtils.flowLayout(false, gap)(pos.get('right'), w * percentages.right, hc, parent));
      }
      if (pos.get('center').length > 0) {
        promises.push(LayoutUtils.flowLayout(true, gap)(pos.get('center'), wc, hc, parent));
      }

      return LayoutUtils.waitFor(promises);
    }

    return BorderLayout;
  }

  static layers(elems: ILayoutElem[], w: number, h: number, parent: ILayoutElem) {
    return LayoutUtils.waitFor(elems.map((elem) => {
      const x = LayoutUtils.grab(elem.layoutOption('prefX', Number.NaN), 0);
      const y = LayoutUtils.grab(elem.layoutOption('prefY', Number.NaN), 0);
      return elem.setBounds(x, y, w - x, h - y);
    }));
  }
  static waitFor(promises: Promise<any>[], redo: boolean = false): Promise<boolean> {
    promises = promises.filter((p) => p != null);
    if (promises.length === 0) {
      return Promise.resolve(redo);
    } else if (promises.length === 1) {
      return promises[0].then(() => redo);
    }
    return Promise.all(promises).then(() => redo);
  }
  static grab(definition: number, v: number) {
    return LayoutUtils.isDefault(definition) ? v : definition;
  }
  private static isDefault(v: number) {
    return v < 0 || isNaN(v);
  }
}
