/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

import {PluginRegistry} from './dist/app/PluginRegistry';
import reg from './dist/phovea';
/**
 * build a registry by registering all phovea modules
 */
//other modules

//self
PluginRegistry.getInstance().register('phovea_core',reg);
