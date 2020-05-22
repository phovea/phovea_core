/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by sam on 25.02.2015.
 */
import { PluginRegistry } from '../app/PluginRegistry';
import { EventHandler } from '../base/event';
export class AView extends EventHandler {
    constructor() {
        super(...arguments);
        this._layoutOptions = {};
    }
    get data() {
        return [];
    }
    get idtypes() {
        return [];
    }
    setLayoutOption(name, value) {
        this._layoutOptions[name] = value;
    }
    layoutOption(name, defaultValue = null) {
        if (this._layoutOptions.hasOwnProperty(name)) {
            return this._layoutOptions[name];
        }
        return defaultValue;
    }
    static list() {
        return PluginRegistry.getInstance().listPlugins('view').map(convertDesc);
    }
}
function convertDesc(desc) {
    const d = desc;
    d.type = d.type || 'main';
    d.location = d.location || 'center';
    return d;
}
//# sourceMappingURL=layout_view.js.map