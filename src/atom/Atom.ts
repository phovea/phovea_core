/**
 * Created by Samuel Gratzl on 14.02.2017.
 */

import {IValueTypeDesc} from '../datatype';
import IAtom, {IAtomDataDescription, IAtomValue} from './IAtom';
import AAtom from './AAtom';
import {list as rlist} from '../range';

export class Atom<T,D extends IValueTypeDesc> extends AAtom<T,D> implements IAtom<T,D> {

 constructor(desc: IAtomDataDescription<D>, private readonly loaded: IAtomValue<T>) {
   super(desc);
  }

  id() {
    return Promise.resolve(rlist(this.loaded.id));
  }

  name() {
   return Promise.resolve(this.loaded.name);
  }

  data() {
   return Promise.resolve(this.loaded.value);
  }
}
