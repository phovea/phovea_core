/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by michael gillhofer
 */
/// <reference path="../../tsd.d.ts" />
'use strict';

export interface StateToken {
  name: string;
  repIDType: boolean;
  value;
  importance: number;
}
