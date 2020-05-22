/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
export interface IIntersectionParam {
  readonly name: string;
  readonly params: any[];
}

export class IntersectionParamUtils {

  static createIntersectionParam(name: string, params: any[]): IIntersectionParam {
    return {name, params};
  }
}
