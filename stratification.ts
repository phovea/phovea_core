/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

'use strict';
import C = require('./main');
import ranges = require('./range');
import datatypes = require('./datatype');
import vector = require('./vector');
import math = require('./math');

export interface IStratification extends datatypes.IDataType {
  range() : C.IPromise<ranges.CompositeRange1D>;
  vector(): C.IPromise<vector.IVector>;

  names();
  names(range:ranges.Range);

  ids(): C.IPromise<ranges.Range>;
  ids(range:ranges.Range): C.IPromise<ranges.Range>;

  hist(): C.IPromise<math.IHistogram>;

  size();
}
