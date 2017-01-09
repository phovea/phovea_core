/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Michael Gillhofer
 */
'use strict';
import IDType from '../idtype/IDType';


export enum TokenType {
    string,
    ordinal,
    ordinalIDType,
    idtype
  }


export interface IStateToken {
  name: string;
  importance: number;
  childs: IStateToken[];
  isLeaf: boolean;
}

export class StateTokenNode implements IStateToken {
  name: string;

  importance: number;

  childs: IStateToken[] = [];

  isLeaf: boolean = false;

  constructor(name:string, importance:number, childs:IStateToken[]) {
    this.name = name;
    this.importance = importance;
    this.childs = childs;
  }
}

export class StateTokenLeaf implements IStateToken {
  name: string;

  hash:string = '';

  importance: number;

  type: TokenType;

  value:number|string|IDType|number[];

  category:string = '';

  childs = [];

  isLeaf = true;

  constructor(name:string,  importance: number,  type: TokenType,  value:number|string|IDType|number[],  category:string = '') {
    this.name = name;
    this.importance = importance;
    this.type = type;
    this.value = value;
    this.category = category;
  }
}
