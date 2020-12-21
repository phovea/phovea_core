/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
import { BaseUtils } from '../base/BaseUtils';
import { DataUtils } from '../data';
export class StratificationUtils {
    static createDefaultStratificationDesc() {
        return BaseUtils.mixin(DataUtils.createDefaultDataDesc(), {
            type: 'stratification',
            idtype: '_rows',
            size: 0,
            groups: [],
            ngroups: 0
        });
    }
}
//# sourceMappingURL=StratificationUtils.js.map