/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

import {IIntersectionParam} from './IIntersectionParam';

export interface IShape {
  asIntersectionParams(): IIntersectionParam;
}
