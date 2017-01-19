
import {defaultSelectionType} from '../idtype/IIDType';
import {IStateToken, StateTokenLeaf, StateTokenNode, TokenType} from './token/StateToken';
import IDType from '../idtype/IDType';
import {EventHandler} from '../event';
import {RandomNumberGenerator} from './internal/RandomNumberGenerator';
import {HashBuilder} from './internal/HashBuilder';
import {SimCats} from './SimilarityCategories';

export class SimHash extends EventHandler {

  private static INSTANCE:SimHash = new SimHash(); // === Singleton

  private static readonly NUMBER_OF_BITS:number = 300;
  private static readonly HASH_TABLE_SIZE:number = 1000;

  /**
   * Uses the singleton pattern
   * @returns {SimHash}
   */
  public static get hasher():SimHash {
    return this.INSTANCE;
  }

  public static normalizeTokenPriority(tokens:IStateToken[], baseLevel:number = 1):IStateToken[] {
    const totalImportance = tokens.reduce((prev, a:IStateToken) => prev + a.importance, 0);
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
      const val = curr[property];
      if (!prev[val]) {
        prev[val] = [];
      }
      prev[val].push(curr);
      return prev;
    }, []);
  }

  private static prepHashCalc(tokens:StateTokenLeaf[], needsNormalization:boolean = true) {
    if (needsNormalization && tokens !== undefined) {
      const totalImportance = tokens.reduce((prev, a:IStateToken) => prev + a.importance, 0);
      tokens = tokens.map((t) => {
        t.importance /= totalImportance;
        return t;
      });
    }
    return SimHash.groupBy(tokens, 'type');
  }

  private static filterLeafsAndSerialize(tokens:IStateToken[]):StateTokenLeaf[] {
    const childs:StateTokenLeaf[] = [];
    tokens.forEach((token:StateTokenLeaf) => {
      if (token.isLeaf) {
        childs.push(token);
      } else {
        childs.concat(this.filterLeafsAndSerialize(token.childs));
      }
    });
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
    const type:IDType = (<IDType>token.value); // TODO ensure that value contains an IDType
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
      return SimCats.CATEGORIES.map(() => SimCats.INVALID.name);
    }
    tokens = SimHash.normalizeTokenPriority(tokens, 1);
    const leafs:StateTokenLeaf[] = SimHash.filterLeafsAndSerialize(tokens);
    const groupedTokens = SimHash.groupBy(leafs, 'category');
    return SimCats.CATEGORIES.map((cat) => this.calcHashOfCat(groupedTokens[cat.name], cat.name));
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
  for (let i = 0; i < str.length; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return (hval >>> 0).toString(2);
  /*tslint:enable:no-bitwise */
  /*jshint bitwise:true */
}


function ordinalHash(min:number, max:number, value:number, nrBits:number):string {
  const pct = (value - min) / (max - min);
  const minH:string = hashFnv32a(String(min), 0);
  const maxH:string = hashFnv32a(String(max), 0);
  const rng = new RandomNumberGenerator(1);

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
