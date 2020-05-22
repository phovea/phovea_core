import { PluginRegistry } from './app/PluginRegistry';
import { LocaleExtensionPointDesc } from './app/extensions';
export default function (registry) {
    //registry.push('extension-type', 'extension-id', function() { return System.import('./extension_impl'); }, {});
    /// #if include('datatype', 'matrix')
    registry.push('datatype', 'matrix', function () { return System.import('./matrix/Matrix'); }, {});
    /// #endif
    /// #if include('datatype', 'table')
    registry.push('datatype', 'table', function () { return System.import('./table/Table'); }, {});
    /// #endif
    /// #if include('datatype', 'vector')
    registry.push('datatype', 'vector', function () { return System.import('./vector/Vector'); }, {});
    /// #endif
    /// #if include('datatype', 'stratification')
    registry.push('datatype', 'stratification', function () { return System.import('./stratification/Stratification'); }, {});
    /// #endif
    /// #if include('datatype', 'graph')
    registry.push('datatype', 'graph', function () { return System.import('./graph/GraphProxy'); }, {});
    /// #endif
    /// #if include('datatype', 'atom')
    registry.push('datatype', 'atom', function () { return System.import('./atom/Atom'); }, {});
    /// #endif
    /// #if include('tabSyncer', 'selection')
    registry.push('tabSyncer', 'selection', function () { return System.import('./sync/SelectionSyncer'); }, {});
    /// #endif
    registry.push(LocaleExtensionPointDesc.EP_PHOVEA_CORE_LOCALE, 'phoveaCoreLocaleEN', function () {
        return System.import('./assets/locales/en/phovea.json').then(PluginRegistry.getInstance().asResource);
    }, {
        ns: 'phovea',
    });
}
//# sourceMappingURL=phovea.js.map