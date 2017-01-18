
import {defaultSelectionType} from '../idtype/IIDType';
import {IStateToken, StateTokenLeaf, StateTokenNode, TokenType} from './token/StateToken';
import IDType from '../idtype/IDType';
import {EventHandler} from '../event';
import {RandomNumberGenerator} from './internal/RandomNumberGenerator';
import {HashBuilder} from './internal/HashBuilder';
import {cat} from './ObjectNode';



export interface ISimilarityCategory {
  name: string;
  color: string;
  icon: string; // font-awesome CSS class
  weight: number;
  active: boolean;
}

export class SimilarityCategories {

  public static readonly INVALID:ISimilarityCategory = {
    name: 'invalid',
    color: '#fff',
    icon: '',
    weight: 0,
    active: false
  };

  public static readonly DATA:ISimilarityCategory = {
    name: cat.data,
    color: '#e41a1c',
    icon: 'fa-database',
    weight: 30,
    active: true
  };

  public static readonly VISUAL:ISimilarityCategory = {
    name: cat.visual,
    color: '#377eb8',
    icon: 'fa-bar-chart',
    weight: 20,
    active: true
  };

  public static readonly SELECTION:ISimilarityCategory = {
    name: cat.selection,
    color: '#984ea3',
    icon: 'fa-pencil-square',
    weight: 25,
    active: true
  };

  public static readonly LAYOUT:ISimilarityCategory = {
    name: cat.layout,
    color: '#ffff33',
    icon: 'fa-desktop',
    weight: 20,
    active: true
  };

  public static readonly LOGIC:ISimilarityCategory = {
    name: cat.logic,
    color: '#ff7f00',
    icon: 'fa-gear',
    weight: 5,
    active: true
  };

  public static readonly CATEGORIES: ISimilarityCategory[] = [
    SimilarityCategories.DATA,
    SimilarityCategories.VISUAL,
    SimilarityCategories.SELECTION,
    SimilarityCategories.LAYOUT,
    SimilarityCategories.LOGIC,
  ];

}


export class SimHash extends EventHandler {

  private static INSTANCE:SimHash = new SimHash(); // === Singleton

  private static readonly NUMBER_OF_BITS:number = 300;
  private static readonly HASH_TABLE_SIZE:number = 1000;

  public static getCategoryColor(category:string) {
    return SimilarityCategories.CATEGORIES.filter((d) => d.name === category)[0].color;
  }

  public static getWeighting():number[] {
    return SimilarityCategories.CATEGORIES.map((d) => d.weight);
  }

  /**
   * Uses the singleton pattern
   * @returns {SimHash}
   */
  public static get hasher():SimHash {
    return this.INSTANCE;
  }

  public static normalizeTokenPriority(tokens:IStateToken[], baseLevel:number = 1):IStateToken[] {
    let totalImportance = tokens.reduce((prev, a:IStateToken) => prev + a.importance, 0);
    return tokens.map((t) => {
      t.importance /= totalImportance * baseLevel;
      if (!(t.isLeaf)) {
        (<StateTokenNode>t).childs = this.normalizeTokenPriority((<StateTokenNode>t).childs, t.importance);
      }
      return t;
    });
  }

  private static groupBy(arr:StateTokenLeaf[], property:string) {
    return arr.reduce((prev, curr:StateTokenLeaf) => {
      let val = curr[property];
      if (!prev[val]) {
        prev[val] = [];
      }
      prev[val].push(curr);
      return prev;
    }, []);
  }

  private static prepHashCalc(tokens:StateTokenLeaf[], needsNormalization:boolean = true) {
    if (needsNormalization && tokens !== undefined) {
      let totalImportance = tokens.reduce((prev, a:IStateToken) => prev + a.importance, 0);
      tokens = tokens.map((t) => {
        t.importance /= totalImportance;
        return t;
      });
    }
    return SimHash.groupBy(tokens, 'type');
  }

  private static filterLeafsAndSerialize(tokens:IStateToken[]):StateTokenLeaf[] {
    let childs:StateTokenLeaf[] = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].isLeaf) {
        childs = childs.concat(<StateTokenLeaf>tokens[i]);
      } else {
        childs = childs.concat(
          this.filterLeafsAndSerialize((<StateTokenNode>tokens[i]).childs)
        );
      }
    }
    return childs;
  }

  private readonly hashBuilder = new Map<string, HashBuilder>();

  private constructor() {
    super();
  }

  private hashBuilderForCategory(category:string):HashBuilder {
    if (this.hashBuilder.has(category)) {
      return this.hashBuilder.get(category);
    }

    const hb = new HashBuilder(SimHash.HASH_TABLE_SIZE);
    this.hashBuilder.set(category, hb);
    return hb;
  }

  public getHashOfIDTypeSelection(token:StateTokenLeaf, selectionType = defaultSelectionType):string {
    let type:IDType = (<IDType>token.value); // TODO ensure that value contains an IDType
    const hb = this.hashBuilderForCategory(type.id);

    type.selections(selectionType).dim(0).asList(0) // array of selected ids
      .map((sel) => {
        return new StateTokenLeaf(
          'dummy',
          1,
          TokenType.string,
          sel.toString()
        );
      })
      .forEach((t) => {
        hb.push(<string>t.value, <string>t.value, t.importance, null); // TODO avoid value cast
      });

    token.hash = hb.toHash(SimHash.NUMBER_OF_BITS);
    return token.hash;
  }

  public getHashOfOrdinalIDTypeSelection(type:IDType, min:number, max:number, selectionType = defaultSelectionType):string {
    const hb = this.hashBuilderForCategory(type.id);

    type.selections(selectionType).dim(0).asList(0) // array of selected ids
      .forEach((sel) => {
        hb.push(
          String(sel), // TODO avoid value cast
          String(sel),
          1,
          ordinalHash(min, max, sel, SimHash.NUMBER_OF_BITS)
        );
      });

    return hb.toHash(SimHash.NUMBER_OF_BITS);
  }

  public calcHash(tokens:IStateToken[]):string[] {
    if (tokens.length === 0) {
      return SimilarityCategories.CATEGORIES.map(() => SimilarityCategories.INVALID.name);
    }
    tokens = SimHash.normalizeTokenPriority(tokens, 1);
    let leafs:StateTokenLeaf[] = SimHash.filterLeafsAndSerialize(tokens);
    let groupedTokens = SimHash.groupBy(leafs, 'category');
    return SimilarityCategories.CATEGORIES.map((cat) => this.calcHashOfCat(groupedTokens[cat.name], cat.name));
  }

  private calcHashOfCat(tokens:StateTokenLeaf[], cat:string) {
    if (tokens === undefined) {
      return Array(SimHash.NUMBER_OF_BITS + 1).join('0');
    }
    const hb = this.hashBuilderForCategory(cat);

    SimHash.prepHashCalc(tokens)
      .forEach((tokenLeafs, index) => {
        this.pushHashBuilder(hb, tokenLeafs, index);
      });

    return hb.toHash(SimHash.NUMBER_OF_BITS);
  };

  private pushHashBuilder(hashBuilder:HashBuilder, tokenLeaves:StateTokenLeaf[], index:number) {
    if(!tokenLeaves) {
      return;
    }

    let hashingFnc;

    switch(index) {
      case 0: // regular tokens
        hashingFnc = (t) => null;
        break;
      case 1: // ordinal tokens
        hashingFnc = (t) => ordinalHash(t.value[0], t.value[1], t.value[2], SimHash.NUMBER_OF_BITS);
        break;
      case 2: // ordinal idType tokens
        hashingFnc = (t) => this.getHashOfOrdinalIDTypeSelection(t.value[0], t.value[1], t.value[2]);
        break;
      case 3: // idtype tokens
        hashingFnc = (t) => this.getHashOfIDTypeSelection(t);
        break;
    }

    tokenLeaves.forEach((t) => {
      hashBuilder.push(t.name, <string>t.value, t.importance, hashingFnc(t));
    });
  };

}

/**
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {number} [seed] optionally pass the hash of the previous chunk
 * @returns {string}
 */
function hashFnv32a(str:string, seed:number):string {
  /*jshint bitwise:false */
  /*tslint:disable:no-bitwise */
  let hval = (typeof seed !== 'undefined') ? 0x811c9dc5 : seed;
  for (let i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return (hval >>> 0).toString(2);
  /*tslint:enable:no-bitwise */
  /*jshint bitwise:true */
}


function ordinalHash(min:number, max:number, value:number, nrBits:number):string {
  let pct = (value - min) / (max - min);
  let minH:string = hashFnv32a(String(min), 0);
  let maxH:string = hashFnv32a(String(max), 0);
  let rng = new RandomNumberGenerator(1);

  let hash:string = '';
  for (let i = 0; i < nrBits; i++) {
    if (rng.nextDouble() > pct) {
      hash = hash + minH.charAt(i % minH.length);
    } else {
      hash = hash + maxH.charAt(i % maxH.length);
    }
  }
  return hash;
}

/*function dec2bin(dec:number):string {
  return (dec >>> 0).toString(2);
}*/
