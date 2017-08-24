/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */

import {mixin, uniqueString} from './index';

/**
 * basic interface of a plugin
 */
export interface IPluginDesc {
  /**
   * type of plugin, a name by convention for identifying different plugin types
   */
  readonly type: string;
  /**
   * name of the plugin, should be unique within a type
   */
  readonly id: string;

  /**
   * human readable name of this plugin
   */
  readonly name: string;

  /**
   * version of this plugin
   * @default 1.0
   */
  readonly version: string;
  /**
   * optional description of this plugin   *
   */
  readonly description: string;

  /**
   * name of the method, which is the entry point of this plugin
   * options:
   *  * `<factorymethod>` the name of the factory method to use
   *  * `new <classname>` will create a new instance of the given class
   *  * `new` will create an instance of the default exported class of this module, same as `new default`
   * @default create
   */
  readonly factory: string;

  /**
   * function for loading this plugin
   * @returns a promise for the loaded plugin
   */
  load(): Promise<IPlugin>;

  /**
   * anything custom
   */
  readonly [key: string]: any;
}

/**
 * basic plugin element
 */
export interface IPlugin {
  /**
   * underlying plugin description
   */
  readonly desc: IPluginDesc;
  /**
   * link to the referenced method as described in the description
   */
  factory(...args: any[]): any;
}

/**
 * determines the factory method to use in case of the 'new ' syntax wrap the class constructor using a factory method
 */
function getFactoryMethod(instance: any, factory: string) {
  let f = factory.trim();

  if (f === 'new') {
    //instantiate the default class
    f = 'new default';
  }
  if (f.startsWith('new ')) {
    const className = f.substring('new '.length);
    return (...args:any[]) => new instance[className](...args);
  }
  return instance[f];
}


const registry: IPluginDesc[] = [];

function push(type: string, idOrLoader: string | (() => any), descOrLoader: any, desc?: any) {
  const id = typeof idOrLoader === 'string' ? <string>idOrLoader : uniqueString(type);
  const loader = typeof idOrLoader === 'string' ? <() => any>descOrLoader : <() => any>descOrLoader;
  const p: IPluginDesc = mixin({
    type,
    id,
    name: id,
    factory: 'create',
    description: '',
    version: '1.0.0',
    load: async (): Promise<IPlugin> => {
      const instance= await Promise.resolve(loader());
      return {desc: p, factory: getFactoryMethod(instance, p.factory)};
    }
  }, typeof descOrLoader === 'function' ? desc : descOrLoader);

  registry.push(p);
}

export interface IRegistry {
  push(type: string, loader: () => any, desc?: any): void;
  push(type: string, id: string, loader: () => any, desc?: any): void;
  push(type: string, idOrLoader: string | (() => any), descOrLoader: any, desc?: any): void;
  /**
   * defined registry using the WebpackDefinePlugin
   */
  flags: object;
}


const knownPlugins = new Set<string>();

export function register(plugin: string, generator?: (registry: IRegistry) => void) {
  if (typeof generator !== 'function') {
    //wrong type - not a function, maybe a dummy inline
    return;
  }
  if (knownPlugins.has(plugin)) {
    return; // don't call it twice
  }
  knownPlugins.add(plugin);

  generator({push, flags: {}});
}

/**
 * returns a list of matching plugin descs
 * @param filter
 * @returns {IPluginDesc[]}
 */
export function list(filter: (string | ((desc: IPluginDesc) => boolean)) = () => true) {
  if (typeof filter === 'string') {
    const v = filter;
    filter = (desc) => desc.type === v;
  }
  return registry.filter(<any>filter);
}

/**
 * returns an extension identified by type and id
 * @param type
 * @param id
 * @returns {IPluginDesc}
 */
export function get(type: string, id: string): IPluginDesc {
  return registry.find((d) => d.type === type && d.id === id);
}

export function load(desc: IPluginDesc[]) {
  return Promise.all(desc.map((d) => d.load()));
}
