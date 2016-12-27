/**
 * Created by Samuel Gratzl on 27.12.2016.
 */

import {IPersistable} from '../index';
import { all, parse, RangeLike} from '../range';
import {SelectAble, resolve as idtypes_resolve, IDType} from '../idtype';
import {IVector} from '../vector';
import {ITable, IQueryArgs} from './ITable';
import TableView from './internal/TableView';
import MultiTableVector from './internal/MultiTableVector';
import {IValueType, IValueTypeDesc} from '../datatype';

/**
 * base class for different Table implementations, views, transposed,...
 */
export abstract class ATable extends SelectAble {
  constructor(protected root: ITable) {
    super();
  }

  get dim() {
    return this.size();
  }

  get nrow() {
    return this.dim[0];
  }

  get ncol() {
    return this.dim[1];
  }

  abstract size(): number[];

  view(range: RangeLike = all()): ITable {
    return new TableView(this.root, parse(range));
  }

  abstract queryView(name: string, args: IQueryArgs): ITable;

  idView(idRange: RangeLike = all()): Promise<ITable> {
    return this.ids().then((ids) => this.view(ids.indexOf(parse(idRange))));
  }

  reduce(f: (row: IValueType[]) => IValueType, this_f?: any, valuetype?: IValueTypeDesc, idtype?: IDType): IVector {
    return new MultiTableVector(this.root, f, this_f, valuetype, idtype);
  }

  restore(persisted: any): IPersistable {
    if (persisted && persisted.f) {
      /* tslint:disable:no-eval */
      return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? idtypes_resolve(persisted.idtype) : undefined);
      /* tslint:enable:no-eval */
    } else if (persisted && persisted.range) { //some view onto it
      return this.view(parse(persisted.range));
    } else {
      return <IPersistable>(<any>this);
    }
  }
}

export default ATable;
