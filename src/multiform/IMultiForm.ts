/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 27.08.2014.
 */

import {IVisInstance, IVisPluginDesc} from '../vis';

export interface IMultiForm extends IVisInstance {
  readonly act: IVisPluginDesc;
  readonly actLoader: Promise<IVisInstance>;
  readonly visses: IVisPluginDesc[];
  switchTo(id: string): Promise<IVisInstance|IVisInstance[]>;
  switchTo(index: number): Promise<IVisInstance|IVisInstance[]>;
  switchTo(vis: IVisPluginDesc): Promise<IVisInstance|IVisInstance[]>;

  addIconVisChooser(toolbar: Element): void;
  addSelectVisChooser(toolbar: Element): void;
}


export interface IMultiFormOptions {
  /**
   * initial visualization
   */
  initialVis?: string|number|IVisPluginDesc;
  /**
   * configuration for all visualizations
   */
  all?: any;
  /**
   * custom config for individual visualizations identified by their id
   */
  [visPluginId: string]: any;
  /**
   * optionally filter the list of visualizations
   * @param vis
   */
  filter?(vis: IVisPluginDesc): boolean;
}
