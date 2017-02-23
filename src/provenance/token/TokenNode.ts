/**
 * Created by Holger Stitz on 23.02.2017.
 */

import {murmurhash2} from '../internal/MurmurHash2';


export class TokenNode {

  public value:string = '';
  public weight:number = 1;

  private _children: Set<TokenNode> = new Set();

  constructor(public name: string, public parent: TokenNode) {
    if (parent) {
      parent.addChild(this);
    }
  }

  addChild(child:TokenNode) {
    this._children.add(child);
  }

  children():Set<TokenNode> {
    return this._children;
  }

  hasChild(child:TokenNode) {
    return this._children.has(child);
  }

  get fqname() {
    if(!this.parent) {
      return this.name;
    }
    // dns style
    return  this.name + '.' + this.parent.fqname;
  }

  toHash():string {
    return murmurhash2(this.value, 0);
  }
}

export class TokenRootNode extends TokenNode {

  constructor(public name: string) {
    super(name, null);
  }

}
