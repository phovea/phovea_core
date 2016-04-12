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
  };

export interface IStateToken {
  name: string;
  type: TokenType;
  value;
  importance: number;
  childs: IStateToken[]
}
