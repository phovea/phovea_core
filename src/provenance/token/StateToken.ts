/**
 * Created by Michael Gillhofer
 */
'use strict';
import IDType from '../../idtype/IDType';


export enum TokenType {
  string,
  ordinal,
  ordinalIDType,
  idtype
}


export interface IStateToken {
  name: string;
  importance: number;
  children: IStateToken[];
  isLeaf: boolean;
}


export interface IMatchedStateToken {
  left: IStateToken;
  right: IStateToken;
}

export class StateTokenNode implements IStateToken {

  isLeaf: boolean = false;

  constructor(
    public name:string,
    public importance:number,
    public children:IStateToken[] = []
  ) {

  }
}

export class StateTokenLeaf implements IStateToken {

  hash:string = '';

  children = [];

  isLeaf = true;

  constructor(
    public name: string,
    public importance: number,
    public type: TokenType,
    public value:number|string|IDType|number[],
    public category:string = ''
  ) {

  }
}
