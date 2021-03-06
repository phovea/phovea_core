import {IRegistry} from './base/plugin';
import {PluginRegistry} from './app/PluginRegistry';
import {EP_PHOVEA_CORE_LOCALE} from './app/extensions';

export default function (registry: IRegistry) {
  //registry.push('extension-type', 'extension-id', function() { return import('./extension_impl'); }, {});
  /// #if include('datatype', 'matrix')
  registry.push('datatype', 'matrix', function () { return import('./matrix/Matrix').then((m) => m.Matrix); }, {
    factory: 'create',
    static: true
  });
  /// #endif
  /// #if include('datatype', 'table')
  registry.push('datatype', 'table', function () { return import('./table/Table').then((m) => m.Table); }, {
    factory: 'create',
    static: true
  });
  /// #endif
  /// #if include('datatype', 'vector')
  registry.push('datatype', 'vector', function () { return import('./vector/Vector').then((m) => m.Vector); }, {
    factory: 'create',
    static: true
  });
  /// #endif
  /// #if include('datatype', 'stratification')
  registry.push('datatype', 'stratification', function () { return import('./stratification/Stratification').then((m) => m.Stratification); },{
    factory: 'create'
  });
  /// #endif
  /// #if include('datatype', 'graph')
  registry.push('datatype', 'graph', function () { return import('./graph/GraphProxy').then((m) => m.GraphProxy); },{
    factory: 'create'
  });
  /// #endif
  /// #if include('datatype', 'atom')
  registry.push('datatype', 'atom', function () { return import('./atom/Atom').then((m) => m.Atom); }, {
    factory: 'create'
  });
  /// #endif
  /// #if include('tabSyncer', 'selection')
  registry.push('tabSyncer', 'selection', function () { return import('./sync/SelectionSyncer').then((m) => m.SelectionSyncerOptionUtils); }, {
    factory: 'create'
  });
  /// #endif
  registry.push(EP_PHOVEA_CORE_LOCALE, 'phoveaCoreLocaleEN', function () {
      return import('./locales/en/phovea.json').then(PluginRegistry.getInstance().asResource);
  }, {
      ns: 'phovea',
  });
}
