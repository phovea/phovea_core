/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

import {IShape} from '../2D/IShape';
import {Vector2D} from '../2D/Vector2D';

export interface ICircle extends IShape {
  x: number;
  y: number;
  radius: number;
  xy: Vector2D;
}
