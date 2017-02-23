/**
 * Created by Holger Stitz on 23.02.2017.
 */

import {murmurhash2} from '../internal/MurmurHash2';

export class TokenNode {

  constructor(public key: string, public value:string, public weight:number = 1) {
    //
  }

  toHash():string {
    return murmurhash2(this.value, 0);
  }
}
