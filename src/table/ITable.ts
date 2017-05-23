/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {mixin} from '../index';
import {RangeLike} from '../range';
import Range from '../range/Range';
import IDType from '../idtype/IDType';
import {IDataType, IValueType, IValueTypeDesc, IDataDescription, createDefaultDataDesc} from '../datatype';
import {IVector} from '../vector';
import {IAnyVector} from '../vector/IVector';

export interface IQueryArgs {
  [key: string]: number|string;
}

export interface ITableColumn<D extends IValueTypeDesc> {
  name: string;
  description?: string;
  value: D;
  getter?(row: any): any;
  /**
   * the accessor for the column
   * @default =name
   */
  column?: string;
}

export declare type IAnyTableColumn = ITableColumn<any>;

/**
 * The description, i.e., the metadata for the table (name, idtype, etc.)
 */
export interface ITableDataDescription extends IDataDescription {
  readonly idtype: string;
  readonly size: number[];
  readonly columns: IAnyTableColumn[];
}

/**
 * A table is a data structure made up of rows and columns. In a table, the elements within a column are always
 * of the same data type; the data types between different columns can vary. For example, the first column in a
 * table can be categorical, the second can be integers, the third can be IDs, etc.
 *
 * Tables support creating ITableViews that represent a subset of the table, but look and feel exactly like a
 * proper table. A table view is backed by the data from the original table.
 *
 * A table uses three different methods to identify a row:
 *  * an index from 0 to max - this is valid only for the current table view
 *  * a globally unique ID - this remains consistent when the table is filtered to a TableView.
 *  * a row name - a string, as specified in the id column in the source data - this remains consistent when the table is filtered to a TableView.
 *
 * UniqueIDs are represented by ranges, row names by arrays of strings.
 * To convert between row names and UniqueIDs, use the idtype member.
 *
 * If your columns are of the same type, use Matrix instead.
 */
export interface ITable extends IDataType {
  readonly desc: ITableDataDescription;

  readonly ncol: number;
  readonly nrow: number;

  /**
   * ID type for the rows. Use this to, e.g., convert between row names and unique row IDs.
   */
  readonly idtype: IDType;

  /**
   * Returns the chosen columns
   * @param range optional subset
   */
  cols(range?: RangeLike): IAnyVector[];

  /**
   * Return the specific column
   * @param i
   */
  col<T, D extends IValueTypeDesc>(i: number): IVector<T, D>;

  /**
   * Returns a promise for getting the row names (string-based row IDs) of the table as an array. The returned IDs
   * remain consistent also in filtered views.
   * @param range optional subset.
   */
  rows(range?: RangeLike): Promise<string[]>;

  /**
   * Returns a promise for getting a range of IDs (not indices). These IDs remain consistent also in filtered views.
   * @param range optional subset
   */
  rowIds(range?: RangeLike): Promise<Range>;

  /**
   * Creates a new view on this table specified by the given range of indices. A view implements the ITable interface
   * yet is still
   * backed by the data from the original table.
   *
   * When passing a single (1D range) the range applies to the rows.
   * When passing a 2D range, the row-range is in the first, the col-range in the
   * second range.
   *
   * @param range
   */
  view(range?: RangeLike): ITable;

  /**
   * TODO: document
   * @param name
   * @param args
   */
  queryView(name: string, args: IQueryArgs): ITable;

  /**
   * Creates a new view on this table specified by the given range of IDs. A view implements the ITable interface yet is
   * still backed by the data from the original table.
   *
   * When passing a single (1D range) the range applies to the rows.
   * When passing a 2D range, the row-range is in the first, the col-range in the
   * second range.
   * @param idRange
   */
  idView(idRange?: RangeLike): Promise<ITable>;

  /**
   * reduces the current matrix to a vector using the given reduce function
   * @param f the reduce function
   * @param thisArgument the this context for the function default the matrix
   * @param valuetype the new value type by default the same as matrix valuetype
   * @param idtype the new vlaue type by default the same as matrix rowtype
   */
  reduce<T, D extends IValueTypeDesc>(f: (row: any[]) => T, thisArgument?: any, valuetype?: D, idtype?: IDType): IVector<T, D>;

  /**
   * returns a promise for getting one cell
   * @param i
   * @param j
   */
  at(i: number, j: number): Promise<IValueType>;

  /**
   * Returns a promise for getting the data as two dimensional array.
   *
   * When passing a single (1D range) the range applies to the rows.
   * When passing a 2D range, the row-range is in the first, the col-range in the
   * second range.
   * @param range
   */
  data(range?: RangeLike): Promise<IValueType[][]>;

  /**
   * Returns the data of the named column as an array with the data
   * @param column the name of the column to retrieve the data from
   * @param range a range operator; optional
   * @deprecated
   */
  colData<T>(column: string, range?: RangeLike): Promise<T[]>;

  /**
   * Returns a promise for getting the data as an array of objects, where each object has
   * fields corresponding to the columns.
   *
   * When passing a single (1D range) the range applies to the rows.
   * When passing a 2D range, the row-range is in the first, the col-range in the
   * second range.
   * @param range
   */
  objects(range?: RangeLike): Promise<any[]>;
}

export default ITable;


export function createDefaultTableDesc(): ITableDataDescription {
  return <ITableDataDescription>mixin(createDefaultDataDesc(), {
    type: 'table',
    idtype: '_rows',
    columns: [],
    size: [0, 0]
  });
}
