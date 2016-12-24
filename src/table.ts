/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {Range} from './range';
import {IDType} from './idtype';
import {IDataType, IValueType, IValueTypeDesc} from './datatype';
import {IVector as IVVector} from './vector';

export declare type IVector = IVVector;

export interface IQueryArgs {
  [key: string]: number|string;
}

export interface ITable extends IDataType {
  readonly ncol : number;
  readonly nrow : number;

  /**
   * id type
   */
  readonly rowtype:IDType;

  /**
   * returns the chosen columns
   * @param range optional subset
   */
  cols(range?:Range) : IVector[];

  /**
   * return the specific column
   * @param i
   */
  col(i:number) : IVector;

  /**
   * returns the row names
   * returns a promise for getting the row names of the matrix
   * @param range optional subset
   */
  rows(range?:Range) : Promise<string[]>;
  /**
   * returns the row ids
   * @param range optional subset
   */
  rowIds(range?:Range) : Promise<Range>;

  /**
   * creates a new view on this matrix specified by the given range
   * @param range
   */
  view(range?:Range) : ITable;

  queryView(name: string, args: IQueryArgs): ITable;

  /**
   * reduces the current matrix to a vector using the given reduce function
   * @param f the reduce function
   * @param this_f the this context for the function default the matrix
   * @param valuetype the new value type by default the same as matrix valuetype
   * @param idtype the new vlaue type by default the same as matrix rowtype
   */
  reduce(f : (row : IValueType[]) => any, this_f? : any, valuetype? : IValueTypeDesc, idtype? : IDType) : IVector;
  /**
   * returns a promise for getting one cell
   * @param i
   * @param j
   */
  at(i:number, j:number) : Promise<IValueType>;
  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?:Range) : Promise<IValueType[][]>;

  /**
   * returns a promise for getting the data as an array of objects
   * @param range
   */
  objects(range?:Range) : Promise<any[]>;
}

export default ITable;
