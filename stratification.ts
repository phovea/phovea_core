/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import ranges = require('./range');
import datatypes = require('./datatype');
import vector = require('./vector');
import math = require('./math');

export interface IStratification extends datatypes.IDataType {
  range() : Promise<ranges.CompositeRange1D>;
  vector(): Promise<vector.IVector>;

  names();
  names(range:ranges.Range);

  ids(): Promise<ranges.Range>;
  ids(range:ranges.Range): Promise<ranges.Range>;

  hist(bins? : number): Promise<math.IHistogram>;

  length: number;

  origin(): Promise<datatypes.IDataType>;
}
