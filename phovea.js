/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

//register all extensions in the registry following the given pattern
module.exports = function (registry) {
  //registry.push('extension-type', 'extension-id', function() { return System.import('./src/extension_impl'); }, {});
  /// #if include('datatype', 'matrix')
  registry.push('datatype', 'matrix', function () {return System.import('./src/matrix/Matrix');}, {});
  /// #endif
  /// #if include('datatype', 'table')
  registry.push('datatype', 'table', function () {return System.import('./src/table/Table');}, {});
  /// #endif
  /// #if include('datatype', 'vector')
  registry.push('datatype', 'vector', function () {return System.import('./src/vector/Vector');}, {});
  /// #endif
  /// #if include('datatype', 'stratification')
  registry.push('datatype', 'stratification', function () {return System.import('./src/stratification/Stratification');}, {});
  /// #endif
  /// #if include('datatype', 'graph')
  registry.push('datatype', 'graph', function () {return System.import('./src/graph/GraphProxy');}, {});
  /// #endif
  /// #if include('datatype', 'atom')
  registry.push('datatype', 'atom', function () {return System.import('./src/atom/Atom');}, {});
  /// #endif
  /// #if include('tabSyncer', 'selection')
  registry.push('tabSyncer', 'selection', function () {return System.import('./src/sync/SelectionSyncer');}, {});
  /// #endif

  registry.push('epPhoveaCoreLocale', 'phoveaCoreLocaleEN', function () {
    return System.import('./src/assets/locales/en/phovea.json').then(function (json) {
      return {
        create: function () {
          return json;
        }
      };
    });
  }, {
    order: 0,
    ns: 'phovea',
    lng: 'en'
  });
};

