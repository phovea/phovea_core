/**
 * Created by Holger Stitz on 13.01.2017.
 */

import {SimVisStateNode} from '../StateNode';
import {TreeNode} from './TreeNode';
import {StateTokenNode, IStateToken} from './StateToken';
import {SimHash} from '../SimilarityHash';

export class MatchedTokenTree {
  get leftState():SimVisStateNode {
    return this._leftState;
  }

  get rightState():SimVisStateNode {
    return this._rightState;
  }

  private size:number = null;
  private root:TreeNode = null;

  private _leftState:SimVisStateNode = null;
  private _rightState:SimVisStateNode = null;

  /*get treeHasPartnerState():boolean {
    return this._leftState !== null && this._leftState !== this._rightState;
  }*/

  constructor(left:SimVisStateNode, right:SimVisStateNode) {
    this.size = 0;
    this.root = new TreeRoot(null, null, this.size++);
    this._leftState = left;
    this._rightState = right;
    let leftTokens:IStateToken[] = left.stateTokens;
    let rightTokens:IStateToken[] = right.stateTokens;
    this.matchIntoNode(this.root, new StateTokenNode('dummyRoot', 1, leftTokens), new StateTokenNode('dummyRoot', 1, rightTokens));
    this.root.balanceWeights(1);
    this.root.setUnscaledSize([1,1,1,1,1]);
    //let sim = this.similarity;
  }

  get rootNode():TreeNode {
    return this.root;
  }


  // matches lists of tokens according to a venn diagramm
  private static matchTokens(leftList:IStateToken[], rightList:IStateToken[]) {
    let left:IStateToken[] = [];
    let center = [];
    let right:IStateToken[] = [];
    for (let i = 0; i < leftList.length; i++) {
      let found:boolean = false;
      for (let j = 0; j < rightList.length; j++) {
        if (leftList[i].name === rightList[j].name) {
          center = center.concat({'left': leftList[i], 'right': rightList[j]});
          found = true;
          break;
        }
      }
      if (!found) {
        left = left.concat(leftList[i]);
      }
    }
    for (let i = 0; i < rightList.length; i++) {
      let found:boolean = false;
      for (let j = 0; j < leftList.length; j++) {
        if (rightList[i].name === leftList[j].name) {
          found = true;
          break;
        }
      }
      if (!found) {
        right = right.concat(rightList[i]);
      }
    }
    return [left, center, right];
  }

  matchIntoNode(root:TreeNode, left:IStateToken, right:IStateToken) {
    if (left === null && right === null) {
      //nothing to do
      return;
    } else if (left === null || right === null) {
      if (left === null) {
        if (!(right.isLeaf)) {
          for (let j = 0; j < (<StateTokenNode>right).childs.length; j++) {
            let node = new TreeNode(null, (<StateTokenNode>right).childs[j], this.size++);
            this.matchIntoNode(node, null, (<StateTokenNode>right).childs[j]);
            root.appendChild(node);
          }
        }
      } else if (right === null) {
        if (!(left.isLeaf)) {
          for (let j = 0; j < (<StateTokenNode>left).childs.length; j++) {
            let node = new TreeNode((<StateTokenNode>left).childs[j], null, this.size++);
            this.matchIntoNode(node, (<StateTokenNode>left).childs[j], null);
            root.appendChild(node);
          }
        }
      }
    } else {

      if (left.isLeaf || right.isLeaf) {
        return;
      } else {
        let leftNode = <StateTokenNode> left;
        let rightNode = <StateTokenNode> right;
        let matchedTokens = MatchedTokenTree.matchTokens(leftNode.childs, rightNode.childs);
        for (let j = 0; j < matchedTokens[0].length; j++) {
          let node = new TreeNode(matchedTokens[0][j], null, this.size++);
          this.matchIntoNode(node, matchedTokens[0][j], null);
          root.appendChild(node);
        }

        for (let j = 0; j < matchedTokens[1].length; j++) {
          let node = new TreeNode((<any>matchedTokens[1][j]).left, (<any>matchedTokens[1][j]).right, this.size++);
          this.matchIntoNode(node, (<any>matchedTokens[1][j]).left, (<any>matchedTokens[1][j]).right);
          root.appendChild(node);
        }

        for (let j = 0; j < matchedTokens[2].length; j++) {
          let node = new TreeNode(null, matchedTokens[2][j], this.size++);
          this.matchIntoNode(node, null, matchedTokens[2][j]);
          root.appendChild(node);
        }
      }
    }
  }

  private _similarity;


  //not affected by weighting. Just delivers the correct proportions of leafs for each category.
  get similarityForLineup() {
    const leftTokens:IStateToken[] = this._leftState.stateTokens;
    const rightTokens:IStateToken[] = this._rightState.stateTokens;
    if (leftTokens.length === 0 && rightTokens.length === 0) {
      return [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1]];
    }
    if (leftTokens.length === 0 || rightTokens.length === 0) {
      return [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
    }

    const leafs:TreeNode[] = this.root.leafs;
    const leftSims = [0, 0, 0, 0, 0];
    const centerSims = [0, 0, 0, 0, 0];
    const rightSims = [0, 0, 0, 0, 0];
    const catContainsToken:boolean[] = [false, false, false, false, false];

    for (let i = 0; i < leafs.length; i++) {
      if (leafs[i].isPaired) {
        catContainsToken[leafs[i].category] = true;
        let sim = leafs[i].tokenSimilarity;
        centerSims[leafs[i].category] += leafs[i].importance * sim;
        leftSims[leafs[i].category] += leafs[i].importance * (1 - sim) / 2;
        rightSims[leafs[i].category] += leafs[i].importance * (1 - sim) / 2;
      } else {
        if (leafs[i].hasLeftToken) {
          catContainsToken[leafs[i].category] = true;
          leftSims[leafs[i].category] += leafs[i].importance;
        } else {
          catContainsToken[leafs[i].category] = true;
          rightSims[leafs[i].category] += leafs[i].importance;
        }
      }
    }


    let total = 0;
    for (let i = 0; i < 5; i++) {
      if (catContainsToken[i]) {
        total = 0;
        total += leftSims[i];
        total += centerSims[i];
        total += rightSims[i];
        leftSims[i] = leftSims[i] / total;
        centerSims[i] = centerSims[i] / total;
        rightSims[i] = rightSims[i] / total;
      } else {
        centerSims[i] = 1;
      }
    }

    return [leftSims, centerSims, rightSims];
  }


  get similarityPerCategory() {
    let leafs:TreeNode[] = this.root.leafs;
    let weights = SimHash.getWeighting();
    const sims = [0, 0, 0, 0, 0];
    const total = [0, 0, 0, 0, 0];
    for (let i = 0; i < leafs.length; i++) {
      total[leafs[i].category] += leafs[i].importance;
      sims[leafs[i].category] += leafs[i].isPaired ? leafs[i].importance * leafs[i].tokenSimilarity : 0;
    }
    for (let i = 0; i < weights.length; i++) {
      sims[i] = total[i] === 0 ? 1 : sims[i] / total[i];
    }
    this._similarity = sims;
    return sims;
  }

  get similarity() {
    let weights = SimHash.getWeighting();
    const sims = this.similarityPerCategory;
    let sim = 0;
    for (let i = 0; i < weights.length; i++) {
      sim += sims[i] === 0 ? weights[i] / 100 : sims[i] * weights[i] / 100;
    }
    return sim;
  }
}


class TreeRoot extends TreeNode {

  constructor(left, right, id) {
    super(left, right, id);
  }

  get isLeafNode():boolean {
    return false;
  }

  get isRoot():boolean {
    return true;
  }

}
