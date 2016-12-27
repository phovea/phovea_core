/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {IPersistable} from '../index';
import {Range, RangeLike, all, range, parse} from '../range';
import {AProductSelectAble, resolve as resolveIDType, IDType} from '../idtype';
import {VALUE_TYPE_CATEGORICAL, VALUE_TYPE_INT, VALUE_TYPE_REAL, ICategoricalValueTypeDesc, INumberValueTypeDesc, IValueType} from '../datatype';
import {IVector} from '../vector';
import {IStatistics, IHistogram, computeStats, hist, categoricalHist} from '../math';
import {IMatrix} from './IMatrix';
import MatrixView from './internal/MatrixView';
import SliceColVector from './internal/SliceColVector';
import ProjectedVector from './internal/ProjectedVector';

function flatten<T>(arr: T[][], indices: Range, select: number = 0) {
  let r = [];
  const dim = [arr.length, arr[0].length];
  if (select === 0) {
    r = r.concat.apply(r, arr);
  } else {
    //stupid slicing
    for (let i = 0; i < dim[1]; ++i) {
      arr.forEach((ai) => {
        r.push(ai[i]);
      });
    }
  }
  return {
    data: r,
    indices: indices.dim(select).repeat(dim[1 - select])
  };
}

/**
 * base class for different Matrix implementations, views, transposed,...
 */
export abstract class AMatrix extends AProductSelectAble {
  constructor(protected root: IMatrix) {
    super();
  }

  abstract size(): number[];

  abstract data(range?: RangeLike): Promise<IValueType[][]>;

  abstract t: IMatrix;

  get dim() {
    return this.size();
  }

  get length() {
    return this.nrow * this.ncol;
  }

  get nrow() {
    return this.dim[0];
  }

  get ncol() {
    return this.dim[1];
  }

  get indices(): Range {
    return range([0, this.nrow], [0, this.ncol]);
  }

  view(range: RangeLike = all()): IMatrix {
    const r = parse(range);
    if (r.isAll) {
      return this.root;
    }
    return new MatrixView(this.root, r);
  }

  slice(col: number): IVector {
    return new SliceColVector(this.root, col);
  }

  stats(): Promise<IStatistics> {
    return this.data().then((d) => computeStats(...d));
  }

  hist(bins?: number, range: RangeLike = all(), containedIds = 0): Promise<IHistogram> {
    const v = this.root.valuetype;
    return this.data(range).then((d) => {
      const flat = flatten(d, this.indices, containedIds);
      switch (v.type) {
        case VALUE_TYPE_CATEGORICAL:
          const vc = <ICategoricalValueTypeDesc>v;
          return categoricalHist(flat.data, flat.indices, flat.data.length, vc.categories.map((d) => typeof d === 'string' ? d : d.name),
            vc.categories.map((d) => typeof d === 'string' ? d : d.name || d.label),
            vc.categories.map((d) => typeof d === 'string' ? 'gray' : d.color || 'gray'));
        case VALUE_TYPE_INT:
        case VALUE_TYPE_REAL:
          const vn = <INumberValueTypeDesc>v;
          return hist(flat.data, flat.indices, flat.data.length, bins ? bins : Math.round(Math.sqrt(this.length)), vn.range);
        default:
          return Promise.reject<IHistogram>('invalid value type: ' + v.type); //cant create hist for unique objects or other ones
      }
    });
  }

  idView(idRange: RangeLike = all()): Promise<IMatrix> {
    const r = parse(idRange);
    if (r.isAll) {
      return Promise.resolve(this.root);
    }
    return this.ids().then((ids) => this.view(ids.indexOf(r)));
  }

  reduce(f: (row: any[]) => any, this_f?: any, valuetype?: any, idtype?: IDType): IVector {
    return new ProjectedVector(this.root, f, this_f, valuetype, idtype);
  }

  restore(persisted: any): IPersistable {
    if (persisted && persisted.f) {
      /* tslint:disable:no-eval */
      return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? resolveIDType(persisted.idtype) : undefined);
      /* tslint:enable:no-eval */
    } else if (persisted && persisted.range) { //some view onto it
      return this.view(parse(persisted.range));
    } else if (persisted && persisted.transposed) {
      return (<IMatrix>(<any>this)).t;
    } else if (persisted && persisted.col) {
      return this.slice(+persisted.col);
    } else if (persisted && persisted.row) {
      return this.t.slice(+persisted.row);
    } else {
      return <IPersistable>(<any>this);
    }
  }

}

export default AMatrix;
