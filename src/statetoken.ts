/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by michael gillhofer
 */
'use strict';


export enum TokenType {
    string,
    ordinal,
    ordinalIDType,
    idtype
  }


export interface IStateToken {
  name: string;
  importance: number;
}

export class StateTokenNode implements IStateToken {
  name: string;
  importance: number;
  childs: IStateToken[];

  constructor(name:string, importance:number, childs:IStateToken[]) {
    this.name = name;
    this.importance = importance;
    this.childs = childs;
  }
}

export class StateTokenLeaf implements IStateToken {
  name: string;
  importance: number;
  type: TokenType;
  value;
  category;

  constructor(name:string,  importance: number,  type: TokenType,  value,  category) {
    this.name = name;
    this.importance = importance;
    this.type = type;
    this.value = value;
    this.category = category;
  }
}
