/**
 * Created by sam on 12.02.2015.
 */
import {GraphNode, isType} from '../graph/graph';
import ActionNode from './ActionNode';
import ObjectNode from './ObjectNode';
import {SimHash} from './SimilarityHash';
import {IStateToken} from './token/StateToken';
import {MatchedTokenTree} from './token/MatchedTokenTree';
import {cat} from './ObjectNode';
import {SimCats} from './SimilarityCategories';


/**
 * a state node is one state in the visual exploration consisting of an action creating it and one or more following ones.
 * In addition, a state is characterized by the set of active object nodes
 */
export default class StateNode extends GraphNode {

  constructor(name: string, description = '') {
    super('state');
    super.setAttr('name', name);
    super.setAttr('description', description);
  }

  //<author>: Michael Gillhofer
  private treeMatches: MatchedTokenTree[] = [];
  public isHoveredInLineUp: boolean = false;
  private _lineupIndex: number = -1;

  get lineUpIndex(): number {
    return this._lineupIndex;
  }

  set lineUpIndex(value: number) {
    this._lineupIndex = value;
  }

  get stateTokens(): IStateToken[] {
    let allTokens: IStateToken[] = this.getAttr('stateTokens');
    if (allTokens === null) {
      allTokens = [];
      for (const oN of this.consistsOf) {
        if (oN.stateTokenPropertyExists) {
          if (oN.category === cat.data) {
            continue;
          }
          allTokens = allTokens.concat(oN.stateTokens);
        }
      }
      allTokens = SimHash.normalizeTokenPriority(allTokens);
      this.setAttr('stateTokens', allTokens);
    }
    return allTokens;
  }

  get simHash(): string[] {
    const simHash: string[] = this.getAttr('simHash');
    if (simHash === null) {
      const allTokens = this.stateTokens;
      const hash: string[] = SimHash.hasher.calcHash(allTokens);
      this.setAttr('simHash', hash);
    }
    return simHash;
  }

  /*
   getSimilarityTo(otherState:StateNode): number{
   return 1-this.numberOfSetBits(this.simHash ^ otherState.simHash)/32
   }
   */

  getSimilarityTo(otherState: StateNode, exact: boolean = false): number {
    //exact = true
    if (exact) {
      return this.getExactSimilarityTo(otherState);
    }
    const thisH: string[] = this.simHash;
    const otherH: string[] = otherState.simHash;
    if (thisH === null || otherH === null) {
      return -1;
    }
    if (thisH[0] === SimCats.INVALID.name || otherH[0] === SimCats.INVALID.name) {
      return -1;
    }
    const weighting = SimCats.getWeights();
    let similarity: number = 0;
    for (let j = 0; j < SimCats.CATEGORIES.length; j++) {
      const len = Math.min(thisH[j].length, otherH[j].length);
      let nrEqu = 0;
      for (let i = 0; i < len; i++) {
        if (thisH[j].charAt(i) === otherH[j].charAt(i)) {
          nrEqu++;
        }
      }
      similarity += (nrEqu / len - 0.5) * 2 * weighting[j] / 100;
    }
    return similarity >= 0 ? similarity : 0;
  }

  public getMatchedTreeWithOtherState(otherState: StateNode): MatchedTokenTree {
    if (otherState === null || otherState === undefined) {
      otherState = this;
    }
    if (this.treeMatches[otherState.id]) {
      return this.treeMatches[otherState.id];
    }
    const tree = new MatchedTokenTree(this, otherState);
    this.treeMatches[otherState.id] = tree;
    otherState.treeMatches[this.id] = tree;
    return tree;
  }

  public getExactSimilarityTo(otherState: StateNode): number {
    if (this.id === otherState.id) {
      return 1;
    }
    const tree: MatchedTokenTree = this.getMatchedTreeWithOtherState(otherState);
    //if (tree === null) return 0;
    return tree.similarity;
  }

  numberOfSetBits(i: number): number {
    /*jshint bitwise:false */
    /*tslint:disable:no-bitwise */
    i = i - ((i >> 1) & 0x55555555);
    i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
    return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
    /*jshint bitwise:true */
    /*tslint:enable:no-bitwise */
  }

  public duplicates: StateNode[] = [];

  //checkduplicate() {

  //if (this.simHash === ){
  // this.duplicates[this.duplicates.length] = state;
  // }
  // }

  //</author>

  get name(): string {
    return super.getAttr('name');
  }

  set name(value: string) {
    super.setAttr('name', value);
  }

  get description(): string {
    return super.getAttr('description', '');
  }

  set description(value: string) {
    super.setAttr('description', value);
  }

  static restore(p: any) {
    const r = new StateNode(p.attrs.name);
    return r.restore(p);
  }

  /**
   * this state consists of the following objects
   * @returns {ObjectNode<any>[]}
   */
  get consistsOf(): ObjectNode<any>[] {
    return this.outgoing.filter(isType('consistsOf')).map((e) => <ObjectNode<any>>e.target);
  }

  /**
   * returns the actions leading to this state
   * @returns {ActionNode[]}
   */
  get resultsFrom(): ActionNode[] {
    return this.incoming.filter(isType('resultsIn')).map((e) => <ActionNode>e.source);
  }

  /**
   *
   * @returns {any}
   */
  get creator() {
    //results and not a inversed actions
    const from = this.incoming.filter(isType('resultsIn')).map((e) => <ActionNode>e.source).filter((s) => !s.isInverse);
    if (from.length === 0) {
      return null;
    }
    return from[0];
  }

  get next(): ActionNode[] {
    return this.outgoing.filter(isType('next')).map((e) => <ActionNode>e.target).filter((s) => !s.isInverse);
  }

  get previousState(): StateNode {
    const a = this.creator;
    if (a) {
      return a.previous;
    }
    return null;
  }

  get previousStates(): StateNode[] {
    return this.resultsFrom.map((n) => n.previous);
  }

  get nextStates(): StateNode[] {
    return this.next.map((n) => n.resultsIn);
  }

  get nextState(): StateNode {
    const r = this.next[0];
    return r ? r.resultsIn : null;
  }

  get path(): StateNode[] {
    const p = this.previousState,
      r: StateNode[] = [];
    r.unshift(this);
    if (p) {
      p.pathImpl(r);
    }
    return r;
  }

  private pathImpl(r: StateNode[]) {
    const p = this.previousState;
    r.unshift(this);
    if (p && r.indexOf(p) < 0) { //no loop
      //console.log(p.toString() + ' path '+ r.join(','));
      p.pathImpl(r);
    }
  }

  toString() {
    return this.name;
  }
}


export class SimVisStateNode extends StateNode {
  lineUpIndex: number;
  isHoveredInLineUp: boolean;
  duplicates: any[]; // any??
  stateTokens: IStateToken[];
}
