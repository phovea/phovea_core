/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 05.08.2014.
 */

export interface ITransform {
  /**
   * scale factors (width, height)
   */
  readonly scale: [number, number];

  /**
   * rotation
   */
  readonly rotate: number;
}
