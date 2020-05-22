/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
export class Token {
    constructor(type, text) {
        this.type = type;
        this.text = text;
    }
    typeis(t) {
        return this.type === t;
    }
}
//# sourceMappingURL=Token.js.map