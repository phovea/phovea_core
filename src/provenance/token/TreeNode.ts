/**
 * Created by Holger Stitz on 13.01.2017.
 */

import {IStateToken, StateTokenLeaf} from './StateToken';
import {SimHash} from '../SimilarityHash';
import {cat} from '../ObjectNode';
import {SimCats} from '../SimilarityCategories';

export class TreeNode {
  get id():number {
    return this._id;
  }

  get children():TreeNode[] {
    return this._children.concat();
  }

  get childrenAndDummyChildren():TreeNode[] {
    return this._children.concat(this._dummyChildren);
  }

  protected _children:TreeNode[] = [];
  private leftToken:IStateToken;
  private rightToken:IStateToken;

  public get category():number {
    if (!(this.isLeafNode)) {
      return null;
    }
    const cat = this.leftToken === null ? (<StateTokenLeaf>this.rightToken).category : (<StateTokenLeaf>this.leftToken).category;
    return SimCats.CATEGORIES.findIndex((d) => d.name === cat);
  }

  public get categoryName():string {
    if (!(this.isLeafNode)) {
      return null;
    }
    return this.leftToken === null ? (<StateTokenLeaf>this.rightToken).category : (<StateTokenLeaf>this.leftToken).category;
  }

  private _id = null;
  private _dummyChildren:TreeNode[] = [];

  constructor(left:IStateToken, right:IStateToken, id) {
    this._id = id;
    this.leftToken = left;
    this.rightToken = right;
    this.checkForDummyChildren();
  }

  checkForDummyChildren() {
    if (this.leftToken === null && this.rightToken === null) {
      return;
    }
    const left:StateTokenLeaf = <StateTokenLeaf>this.leftToken;
    const right:StateTokenLeaf = <StateTokenLeaf>this.rightToken;
    if (left !== null) {
      if (!(left instanceof StateTokenLeaf)) {
        return;
      }
      if (right !== null) {
        //both left and right
        if (!(left.category === cat.selection)) {
          return;
        }
        const sim = this.tokenSimilarity;
        const leftChildMatch:StateTokenLeaf = new StateTokenLeaf('Matching', left.importance, left.type, 'matching', cat.selection);
        const rightChildMatch:StateTokenLeaf = new StateTokenLeaf('Matching', right.importance, left.type, 'matching', cat.selection);
        this._dummyChildren = this._dummyChildren.concat(new DummyTreeNode(leftChildMatch, rightChildMatch, this.id + '_match', sim));
        const leftChildNonMatch:StateTokenLeaf = new StateTokenLeaf('Non-Matching', left.importance, left.type, 'non-matching', cat.selection);
        const rightChildNonMatch:StateTokenLeaf = new StateTokenLeaf('Non-Matching', right.importance, left.type, 'non-matching', cat.selection);
        this._dummyChildren = this._dummyChildren.concat(new DummyTreeNode(leftChildNonMatch, rightChildNonMatch, this.id + '_match', (1 - sim)));
        return;
      } else {
        //just left
        if (!(left.category === cat.selection)) {
          return;
        }
        const leftChildMatch:StateTokenLeaf = new StateTokenLeaf('Matching', left.importance, left.type, 'matching', cat.selection);
        this._dummyChildren = this._dummyChildren.concat(new DummyTreeNode(leftChildMatch, null, this.id + '_match',0));
      }
    } else {
      if (right !== null) {
        if (!(right instanceof StateTokenLeaf)) {
          return;
        }
        if (!(right.category === cat.selection)) {
          return;
        }
        const rightChildMatch:StateTokenLeaf = new StateTokenLeaf('Matching', right.importance, right.type, 'matching', cat.selection);
        this._dummyChildren = this._dummyChildren.concat(new DummyTreeNode(null, rightChildMatch, this.id + '_match',0));
      } else {
        //both are null
        return;
      }
    }


  }


  appendChild(ch:TreeNode) {
    this._children = this._children.concat(ch);
  }

  //stores the importance of all children (recursive) per category.
  private impPerCat:number[] = null;

  get impOfChildrenPerCat():number[] {
    if (this.impPerCat === null) {
      const childrenImpPerCat:number[] = Array(SimCats.CATEGORIES.length).fill(0);
      if (this.isLeafNode) {
        childrenImpPerCat[SimCats.CATEGORIES.findIndex((d) => d.name === this.categoryName)] += this.importance;
        this.impPerCat = childrenImpPerCat;
        return childrenImpPerCat;
      }
      this._children.forEach((child) => {
        if (child.isLeafNode) {
          childrenImpPerCat[SimCats.CATEGORIES.findIndex((d) => d.name === child.categoryName)] += child.importance;
        } else {
          child.impOfChildrenPerCat.forEach((importance, index) => {
            childrenImpPerCat[index] += importance;
          });
        }
      });
      this.impPerCat = childrenImpPerCat;
    }
    return this.impPerCat;
  }

  public get tokenSimilarity():number {
    if (this.leftToken === null || this.rightToken === null) {
      return 0;
    }
    if (!this.leftToken.isLeaf) {
      throw Error('Only Leafs similarity should be used');
    } else {
      switch ((<StateTokenLeaf>this.leftToken).type) {
        case 0:
          return (<StateTokenLeaf>this.leftToken).value === (<StateTokenLeaf>this.rightToken).value ? 1 : 0;
        case 1:
          const left:StateTokenLeaf = <StateTokenLeaf>this.leftToken;
          const right:StateTokenLeaf = <StateTokenLeaf>this.rightToken;
          const leftpct = (left.value[2] - left.value[0]) / (left.value[1] - left.value[0]);
          const rightpct = (right.value[2] - right.value[0]) / (right.value[1] - right.value[0]);
          return 1 - Math.abs(leftpct - rightpct);
        case 2:
        case 3:
          return TreeNode.similarityFromHash((<StateTokenLeaf>this.leftToken).hash, (<StateTokenLeaf>this.rightToken).hash);
      }
    }
  }

  private static similarityFromHash(hash1:string, hash2:string) {
    if (hash1 === null && hash2 === null) {
      return 1;
    }
    if (hash1 === null || hash2 === null) {
      return 0;
    }
    const len = Math.min(hash1.length, hash2.length);
    let nrEqu = 0;
    for (let i = 0; i < len; i++) {
      if (hash1.charAt(i) === hash2.charAt(i)) {
        nrEqu++;
      }
    }
    return Math.max((nrEqu / len - 0.5) * 2 , 0);
  }


  get importance():number {
    if (this.leftToken === null) {
      if (this.rightToken === null) {
        return 1; //must be the root node
      } else {
        return this.rightToken.importance;
      }
    }
    return this.leftToken.importance;
  }


  get isRoot():boolean {
    return false;
  }

  get name():string {
    let name = this.leftToken === null ? null : this.leftToken.name;
    if (name == null) {
      name = this.rightToken === null ? null : this.rightToken.name;
    }
    return name;
  }

  balanceWeights(targetWeight:number) {
    let factor:number = 1;
    this._children
      .filter((d) => d.isPaired && d.leftToken.importance !== d.rightToken.importance)
      .forEach((d) => {
        factor = d.leftToken.importance / d.rightToken.importance;
      });

    if (factor > 1) {
      this._children
        .filter((d) => d.leftToken !== null)
        .forEach((d) => {
          d.leftToken.importance /= factor;
        });

    } else if (factor < 1) {
      this._children
        .filter((d) => d.rightToken !== null)
        .forEach((d) => {
          d.rightToken.importance *= factor;
        });
    }

    let sumFactor = 0;

    this._children.forEach((d) => {
      if (d.leftToken !== null) {
        sumFactor += d.leftToken.importance;
      } else if (d.rightToken !== null) {
        sumFactor += d.rightToken.importance;
      }
    });

    if (sumFactor !== targetWeight) {
      this._children.forEach((d) => {
        if (d.leftToken !== null) {
          d.leftToken.importance *= (targetWeight / sumFactor);
        }
        if (d.rightToken !== null) {
          d.rightToken.importance *= (targetWeight / sumFactor);
        }
      });
    }

    //balance all children
    this._children
      .filter((d) => d.isLeafNode === false)
      .forEach((d) => {
        d.balanceWeights(d.leftToken !== null ? d.leftToken.importance : d.rightToken.importance);
      });
  }

  protected _unscaledSize = -1;

  get getScaledSize() {
    const weights = SimCats.getWeights();
    return this._unscaledSize * weights[this.category];
  }

  setUnscaledSize(target:number[]) {
    const currentImp = this.impOfChildrenPerCat;
    if (this.isLeafNodeWithoutDummyChildren) {
      this._unscaledSize = target[this.category];
      return;
    }

    const dummyAndOtherChildren:TreeNode[] = this._children.concat(this._dummyChildren);
    dummyAndOtherChildren.forEach((child) => {
      const targetCpy = target.slice(0);
      const childImp = child.impOfChildrenPerCat;
      for (let j = 0; j < SimCats.CATEGORIES.length; j++) {
        if (childImp[j]===0) {
          continue;
        }
        const ratio = currentImp[j]/childImp[j];
        targetCpy[j] = targetCpy[j]/ratio;
      }
      child.setUnscaledSize(targetCpy);
    });
  }

  get isLeafNodeWithoutDummyChildren():boolean {
    return (this._children.length === 0 && this._dummyChildren.length === 0);
  }

  get isLeafNode():boolean {
    return this._children.length === 0;
  }

  get isPaired():boolean {
    return (this.leftToken !== null && this.rightToken !== null);
  }

  get hasLeftToken():boolean {
    return !(this.leftToken === null);
  }

  get hasRightToken():boolean {
    return !(this.rightToken === null);
  }

  get leaves():TreeNode[] {
    if (!this.isLeafNode) {
      return this._children
        .map((child) => child.leaves)
        .reduce((a, b) => a.concat(b), []);
    }

    return [this];
  }
}


class DummyTreeNode extends TreeNode {

  private tokenSim = -1;

  constructor(left:IStateToken, right:IStateToken, id, unscaledSize) {
    super(left, right, id);
    this.tokenSim = unscaledSize;
  }

  get getScaledSize() {
    const weights = SimCats.getWeights();
    return this.tokenSim * weights[this.category];
  }

  get tokenSimilarity():number {
    return 1;
  }

  checkForDummyChildren() {
    return;
  }

}
