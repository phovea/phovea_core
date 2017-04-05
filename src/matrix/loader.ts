/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {getAPIJSON, api2absURL, getAPIData} from '../ajax';
import {list as rlist, Range, all, join, parse} from '../range';
import {mask, INumberValueTypeDesc, VALUE_TYPE_INT, VALUE_TYPE_REAL} from '../datatype';
import {IHistogram, wrapHist, IAdvancedStatistics, computeAdvancedStats} from '../math';
import {IMatrixDataDescription, IHeatMapUrlOptions} from './IMatrix';

export interface IMatrixLoader<T> {
  (desc: IMatrixDataDescription<any>): Promise<{
    rowIds: Range;
    rows: string[];
    colIds: Range;
    cols: string[];
    ids: Range;
    data: T[][];
  }>;
}

export interface IMatrixLoader2<T> {
  rowIds(desc: IMatrixDataDescription<any>, range: Range): Promise<Range>;
  rows(desc: IMatrixDataDescription<any>, range: Range): Promise<string[]>;
  colIds(desc: IMatrixDataDescription<any>, range: Range): Promise<Range>;
  cols(desc: IMatrixDataDescription<any>, range: Range): Promise<string[]>;
  ids(desc: IMatrixDataDescription<any>, range: Range): Promise<Range>;
  at(desc: IMatrixDataDescription<any>, i: number, j: number): Promise<T>;
  data(desc: IMatrixDataDescription<any>, range: Range): Promise<T[][]>;
  numericalHist?(desc: IMatrixDataDescription<any>, range: Range, bins?: number): Promise<IHistogram>;
  numericalStats?(desc: IMatrixDataDescription<any>, range: Range): Promise<IAdvancedStatistics>;
  heatmapUrl?(desc: IMatrixDataDescription<any>, range: Range, options: IHeatMapUrlOptions): string;
}

export function adapterOne2Two<T>(loader: IMatrixLoader<T>): IMatrixLoader2<T> {
  return {
    rowIds: (desc: IMatrixDataDescription<any>, range: Range) => loader(desc).then((d) => range.preMultiply(d.rowIds, desc.size)),
    rows: (desc: IMatrixDataDescription<any>, range: Range) => loader(desc).then((d) => range.dim(0).filter(d.rows, desc.size[0])),
    colIds: (desc: IMatrixDataDescription<any>, range: Range) => loader(desc).then((d) => range.preMultiply(d.colIds, desc.size)),
    cols: (desc: IMatrixDataDescription<any>, range: Range) => loader(desc).then((d) => range.dim(1).filter(d.cols, desc.size[1])),
    ids: (desc: IMatrixDataDescription<any>, range: Range) => loader(desc).then((d) => range.preMultiply(d.ids, desc.size)),
    at: (desc: IMatrixDataDescription<any>, i: number, j: number) => loader(desc).then((d) => d.data[i][j]),
    data: (desc: IMatrixDataDescription<any>, range: Range) => loader(desc).then((d) => range.filter(d.data, desc.size))
  };
}

function maskIt(desc: IMatrixDataDescription<any>) {
  if (desc.value.type === VALUE_TYPE_INT || desc.value.type === VALUE_TYPE_REAL) {
    return (v: number|number[]) => mask(v, <INumberValueTypeDesc>desc.value);
  }
  return (v: number|number[]) => v;
}

export function viaAPI2Loader(): IMatrixLoader2<any> {
  let rowIds: Promise<Range> = null,
    rows: Promise<string[]> = null,
    colIds: Promise<Range> = null,
    cols: Promise<string[]> = null,
    data: Promise<any[][]> = null,
    hist: Promise<IHistogram> = null,
    stats: Promise<IAdvancedStatistics> = null;
  const r = {
    rowIds: (desc: IMatrixDataDescription<any>, range: Range) => {
      if (rowIds == null) {
        rowIds = getAPIJSON(`/dataset/matrix/${desc.id}/rowIds`).then(parse);
      }
      return rowIds.then((d) => d.preMultiply(range, desc.size));
    },
    rows: (desc: IMatrixDataDescription<any>, range: Range) => {
      if (rows == null) {
        rows = getAPIJSON(`/dataset/matrix/${desc.id}/rows`);
      }
      return rows.then((d) => range.dim(0).filter(d, desc.size[0]));
    },
    colIds: (desc: IMatrixDataDescription<any>, range: Range) => {
      if (colIds == null) {
        colIds = getAPIJSON(`/dataset/matrix/${desc.id}/colIds`).then(parse);
      }
      return colIds.then((d) => d.preMultiply(range, desc.size));
    },
    cols: (desc: IMatrixDataDescription<any>, range: Range) => {
      if (cols == null) {
        cols = getAPIJSON(`/dataset/matrix/${desc.id}/cols`);
      }
      return cols.then((d) => range.dim(1).filter(d, desc.size[1]));
    },
    ids: (desc: IMatrixDataDescription<any>, range: Range) => {
      if (range.ndim === 1) {
        return r.rowIds(desc, range);
      }
      range.dim(0); //ensure two dim
      range.dim(1); //ensure two dim
      const split = range.split();
      return Promise.all([r.rowIds(desc, split[0] || all()), r.colIds(desc, split[1] || all())]).then(join);
    },
    numericalStats: (desc: IMatrixDataDescription<any>, range: Range): Promise<IAdvancedStatistics> => {
      if (range.isAll) {
        if (stats == null) {
          stats = getAPIJSON(`/dataset/matrix/${desc.id}/stats`);
        }
        return stats;
      }
      const args: any = {
        range: range.toString()
      };
      return getAPIJSON(`/dataset/matrix/${desc.id}/stats`, args);
    },
    numericalHist: (desc: IMatrixDataDescription<any>, range: Range, bins: number = NaN) => {
      const valueRange = (<INumberValueTypeDesc>desc.value).range;
      if (range.isAll) {
        if (hist == null) {
          hist = getAPIJSON(`/dataset/matrix/${desc.id}/hist`).then((hist: number[]) => wrapHist(hist, valueRange));
        }
        return hist;
      }
      const args: any = {
        range: range.toString()
      };
      if (!isNaN(bins)) {
        args.bins = bins;
      }
      return getAPIJSON(`/dataset/matrix/${desc.id}/hist`, args).then((hist: number[]) => wrapHist(hist, valueRange));
    },
    at: (desc: IMatrixDataDescription<any>, i: number, j: number) => r.data(desc, rlist([i], [j])).then((data) => maskIt(desc)(data[0][0])),
    data: (desc: IMatrixDataDescription<any>, range: Range) => {
      if (range.isAll) {
        if (data == null) {
          data = getAPIJSON(`/dataset/matrix/${desc.id}/raw`).then(maskIt(desc));
        }
        return data;
      }
      if (data != null) { //already loading all
        return data.then((d) => range.filter(d, desc.size));
      }
      const size = desc.size;
      if (size[0] * size[1] < 1000 || desc.loadAtOnce) { //small file load all
        data = getAPIJSON(`/dataset/matrix/${desc.id}/raw`).then(maskIt(desc));
        return data.then((d) => range.filter(d, desc.size));
      }
      //server side slicing
      return getAPIData(`/dataset/matrix/${desc.id}/raw`, {range: range.toString()}).then(maskIt(desc));
    },
    heatmapUrl: (desc: IMatrixDataDescription<any>, range: Range, options: IHeatMapUrlOptions) => {
      const args: any = {
        format: options.format || 'png',
        range: range.toString()
      };
      if (options.transpose === true) {
        args.format_transpose = true;
      }
      if (options.range) {
        args.format_min = options.range[0];
        args.format_max = options.range[1];
      }
      if (options.palette) {
        args.format_palette = options.palette.toString();
      }
      return api2absURL(`/dataset/matrix/${desc.id}/data`, args);
    }
  };
  return r;
}
