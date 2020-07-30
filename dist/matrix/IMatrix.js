/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
import { DataUtils } from '../data';
import { BaseUtils } from '../base/BaseUtils';
export class MatrixUtils {
    static createDefaultMatrixDesc() {
        return BaseUtils.mixin(DataUtils.createDefaultDataDesc(), {
            type: 'matrix',
            rowtype: '_rows',
            coltype: '_cols',
            size: [0, 0]
        });
    }
}
//# sourceMappingURL=IMatrix.js.map