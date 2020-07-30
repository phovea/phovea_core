/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
export class Token {
  constructor(public type: number, public text: any) {

  }

  typeis(t: number) {
    return this.type === t;
  }
}
