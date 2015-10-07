/*******************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 ******************************************************************************/
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import ranges = require('./range');
import idtypes = require('./idtype');
import datatypes = require('./datatype');
import vector = require('./vector');
import math = require('./math');

export interface IMatrix extends datatypes.IDataType {
  /**
   * nrow * ncol
   */
  length : number;
  /**
   * number of rows
   */
  nrow: number;
  /**
   * number of cols
   */
  ncol : number;
  /**
   * type of the value - to be specified
   */
  valuetype:any;
  /**
   * row id type
   */
  rowtype:idtypes.IDType;
  /**
   * column id type
   */
  coltype:idtypes.IDType;

  /**
   * creates a new view on this matrix specified by the given range
   * @param range
   */
  view(range?:ranges.Range) : IMatrix;

  slice(col: number): vector.IVector;

  //view(filter: string): Promise<IMatrix>;

  /**
   * reduces the current matrix to a vector using the given reduce function
   * @param f the reduce function
   * @param this_f the this context for the function default the matrix
   * @param valuetype the new value type by default the same as matrix valuetype
   * @param idtype the new vlaue type by default the same as matrix rowtype
   */
  reduce(f : (row : any[]) => any, this_f? : any, valuetype? : any, idtype? : idtypes.IDType) : vector.IVector;
  /**
   * transposed version of this matrix
   */
  t : IMatrix;
  /**
   * returns a promise for getting the col names of the matrix
   * @param range
   * @returns {IPromise<string[]>}
   */
  cols(range?:ranges.Range) : Promise<string[]>;
  colIds(range?:ranges.Range) : Promise<ranges.Range>;
  /**
   * returns a promise for getting the row names of the matrix
   * @param range
   */
  rows(range?:ranges.Range) : Promise<string[]>;
  rowIds(range?:ranges.Range) : Promise<ranges.Range>;

  /**
   * returns a promise for getting one cell
   * @param i
   * @param j
   */
  at(i:number, j:number) : Promise<any>;
  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?:ranges.Range) : Promise<any[][]>;

  stats() : Promise<math.IStatistics>;

  hist(bins? : number, range?:ranges.Range, containedIds? : number) : Promise<math.IHistogram>;


  heatmapUrl(range?: ranges.Range, options?: { format?: string; transpose?: boolean; range?: [number,number]}): string;
}
