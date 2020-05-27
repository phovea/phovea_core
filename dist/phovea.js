import { PluginRegistry } from './app/PluginRegistry';
import { EP_PHOVEA_CORE_LOCALE } from './app/extensions';
export default function (registry) {
    //registry.push('extension-type', 'extension-id', function() { return import('./extension_impl'); }, {});
    /// #if include('datatype', 'matrix')
    registry.push('datatype', 'matrix', function () { return import('./matrix/Matrix'); }, {});
    /// #endif
    /// #if include('datatype', 'table')
    registry.push('datatype', 'table', function () { return import('./table/Table'); }, {});
    /// #endif
    /// #if include('datatype', 'vector')
    registry.push('datatype', 'vector', function () { return import('./vector/Vector'); }, {});
    /// #endif
    /// #if include('datatype', 'stratification')
    registry.push('datatype', 'stratification', function () { return import('./stratification/Stratification'); }, {});
    /// #endif
    /// #if include('datatype', 'graph')
    registry.push('datatype', 'graph', function () { return import('./graph/GraphProxy'); }, {});
    /// #endif
    /// #if include('datatype', 'atom')
    registry.push('datatype', 'atom', function () { return import('./atom/Atom'); }, {});
    /// #endif
    /// #if include('tabSyncer', 'selection')
    registry.push('tabSyncer', 'selection', function () { return import('./sync/SelectionSyncer'); }, {});
    /// #endif
    registry.push(EP_PHOVEA_CORE_LOCALE, 'phoveaCoreLocaleEN', function () {
        return import('./assets/locales/en/phovea.json').then(PluginRegistry.getInstance().asResource);
    }, {
        ns: 'phovea',
    });
}
//# sourceMappingURL=phovea.js.map