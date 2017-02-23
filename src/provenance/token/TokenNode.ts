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

  /**
   * Appends a child node to the current node
   * @param child
   */
  addChild(child:TokenNode) {
    this._children.add(child);
  }

  /**
   * Returns a list of children
   * @returns {Set<TokenNode>}
   */
  children():TokenNode[] {
    return Array.from(this._children);
  }

  /**
   * Checks if this node has a given node as immediate child
   * @param child
   * @returns {boolean}
   */
  hasChild(child:TokenNode) {
    return this._children.has(child);
  }

  /**
   * Returns the full-qualified name in DNS style
   * @returns {string}
   */
  get fqname() {
    if(!this.parent) {
      return this.name;
    }
    // dns style
    return  this.name + '.' + this.parent.fqname;
  }

  /**
   * Returns a hash based on the value
   * @returns {string}
   */
  toHash():string {
    return murmurhash2(this.value, 0);
  }
}

export class TokenRootNode extends TokenNode {

  constructor(public name: string) {
    super(name, null);
  }

}
