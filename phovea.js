/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

//register all extensions in the registry following the given pattern
module.exports = function(registry) {
  //registry.push('extension-type', 'extension-id', function() { return import('./src/extension_impl'); }, {});
  /// #if include('datatype', 'matrix')
  registry.push('datatype', 'matrix', function() { return import('./src/matrix/Matrix'); }, {});
  /// #endif
  /// #if include('datatype', 'table')
  registry.push('datatype', 'table', function() { return import('./src/table/Table'); }, {});
  /// #endif
  /// #if include('datatype', 'vector')
  registry.push('datatype', 'vector', function() { return import('./src/vector/Vector'); }, {});
  /// #endif
  /// #if include('datatype', 'stratification')
  registry.push('datatype', 'stratification', function() { return import('./src/stratification/Stratification'); }, {});
  /// #endif
  /// #if include('datatype', 'graph')
  registry.push('datatype', 'graph', function() { return import('./src/graph/GraphProxy'); }, {});
  /// #endif
  /// #if include('datatype', 'atom')
  registry.push('datatype', 'atom', function() { return import('./src/atom/Atom'); }, {});
  /// #endif
  /// #if include('tabSyncer', 'selection')
  registry.push('tabSyncer', 'selection', function() { return import('./src/sync/SelectionSyncer'); }, {});
  /// #endif
};

