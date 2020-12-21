/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
import { DataUtils } from '../data/DataUtils';
import { BaseUtils } from '../base/BaseUtils';
export class VectorUtils {
    static createDefaultVectorDesc() {
        return BaseUtils.mixin(DataUtils.createDefaultDataDesc(), {
            type: 'vector',
            idtype: '_rows',
            size: 0,
            value: {
                type: 'string'
            }
        });
    }
}
//# sourceMappingURL=VectorUtils.js.map