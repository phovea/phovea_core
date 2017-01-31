/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {getAPIJSON} from '../ajax';
import {Range, parse} from '../range';
import {IValueType} from '../datatype';
import {IVectorDataDescription} from './IVector';

/**
 * @internal
 */
export interface IVectorLoaderResult<T> {
  readonly rowIds: Range;
  readonly rows: string[];
  readonly data: T[];
}

/**
 * @internal
 */
export interface IVectorLoader<T> {
  (desc: IVectorDataDescription<any>): Promise<IVectorLoaderResult<T>>;
}


/**
 * @internal
 */
export function viaAPILoader() {
  let _loader = undefined;
  return (desc) => {
    if (_loader) { //in the cache
      return _loader;
    }
    return _loader = getAPIJSON('/dataset/' + desc.id).then((data) => {
      data.rowIds = parse(data.rowIds);
      return data;
    });
  };
}

/**
 * @internal
 */
export function viaDataLoader(rows: string[], rowIds: number[], data: IValueType[]) {
  let _data = undefined;
  return () => {
    if (_data) { //in the cache
      return Promise.resolve(_data);
    }
    _data = {
      rowIds: parse(rowIds),
      rows: rows,
      data: data
    };
    return Promise.resolve(_data);
  };
}
