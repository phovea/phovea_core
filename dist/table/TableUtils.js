/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
import { BaseUtils } from '../base/BaseUtils';
import { DataUtils } from '../data/DataUtils';
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
export class TableUtils {
    static createDefaultTableDesc() {
        return BaseUtils.mixin(DataUtils.createDefaultDataDesc(), {
            type: 'table',
            idtype: '_rows',
            columns: [],
            size: [0, 0]
        });
    }
}
//# sourceMappingURL=TableUtils.js.map