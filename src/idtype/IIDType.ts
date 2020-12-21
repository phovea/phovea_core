/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {IPersistable} from '../base/IPersistable';
import {IEventHandler} from '../base/event';

export interface IIDType extends IEventHandler, IPersistable {
  readonly id: string;
  readonly name: string;
  readonly names: string;
  readonly internal: boolean;
  toString(): string;
  selectionTypes(): string[];
  clear(): void;
  clear(type: string): void;
}
