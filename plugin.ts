/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 05.08.2014.
 */

import C = require('./main');
//somehow here
declare var require : (deps:string[], callback:(deps:any[])=>any) => any;


/**
 * basic interface of a plugin
 */
export interface IPluginDesc {
  /**
   * type of plugin, a name by convention for identifying different plugin types
   */
  type : string;
  /**
   * name of the plugin, should be unique within a type
   */
  id : string;

  /**
   * human readable name of this plugin
   */
  name: string;

  /**
   * name of the require.js module to load
   * @default ./<name>/index
   */
  module : string;
  /**
   * name of the method, which is the entry point of this plugin
   * @default create
   */
  factory: string;
  /**
   * version of this plugin
   * @default 1.0
   */
  version: string;
  /**
   * optional description of this plugin   *
   */
  description: string;

  /**
   * function for loading this plugin
   * @returns a promise for the loaded plugin
   */
  load() : Promise<IPlugin>;
}

/**
 * basic plugin element
 */
export interface IPlugin {
  /**
   * underlying plugin description
   */
  desc: IPluginDesc;
  /**
   * link to the referenced method as described in the description
   */
  factory(...args:any[]): any;

  [extras: string]: any;
}

/**
 * utility function to create a loading promise function which wraps require.js
 * @param desc
 * @returns {function(): Promise}
 */
function loadHelper(desc:IPluginDesc):() => Promise<IPlugin> {
  return () => new Promise<IPlugin>((resolver) => {
    //we have the instance given
    const loader = (<any>desc).loader;
    const instance = (<any>desc).instance || (loader ? loader() : null);
    if (instance) {
      resolver({
        desc: desc,
        impl: instance,
        factory: instance[desc.factory]
      });
    } else {
        //require module
        require([desc.module], (m) => {
          //create a plugin entry
          resolver({
            desc: desc,
            impl: m,
            factory: m[desc.factory]
          });
        });
      }
  });
}


function parsePlugin(desc: any,  baseUrl: string = '', relativeUrl: string = '..') {
  //provide some default values
  desc = C.mixin({
    name : desc.id,
    folder: desc.folder,
    file: 'main',
    factory: 'create',
    description: '',
    version: '1.0'
  },desc);
  desc = C.mixin({
    'module' : desc.folder+'/'+desc.file,
    baseUrl: baseUrl + '/' + desc.folder
  }, desc);
  desc.module = relativeUrl + '/' +desc.module;
  desc.load = loadHelper(<IPluginDesc>desc);
  return <IPluginDesc>desc;
}
/**
 * parses the given descriptions and creates a full description out of it
 * @param descs
 * @returns {IPluginDesc[]}
 */
function parsePlugins(descs : any[], baseUrl: string = '', relativeUrl: string = '..') {
  return descs.map((desc) => parsePlugin(desc, baseUrl, relativeUrl));
}


//map to descriptions
var _extensions : IPluginDesc[] = [];


/**
 * returns a list of matching plugin descs
 * @param filter the filter function to apply
 * @returns {IPluginDesc[]}
 */
export function list(filter : (desc : IPluginDesc) => boolean): IPluginDesc[];
/**
 * returns a list of matching plugin descs
 * @param type the desired plugin type
 * @returns {IPluginDesc[]}
 */
export function list(type : string): IPluginDesc[];
/**
 * returns a list of matching plugin descs
 * @param filter
 * @returns {IPluginDesc[]}
 */
export function list(filter : any = C.constantTrue) {
  if (typeof filter === 'string') {
    var v = filter;
     filter = (desc) => desc.type === v;
  }
  if (_extensions.length === 0) {
    _extensions = parsePlugins(C.registry.extensions, C.registry.baseUrl, C.registry.relativeUrl);
  }
  if (filter === C.constantTrue) {
    return _extensions;
  }
  return _extensions.filter(filter);
}

/**
 * pushes a new description to the registry
 * @param desc
 * @param baseUrl
 * @param relativeUrl
 * @returns {IPluginDesc}
 */
export function push(desc: any, baseUrl = C.registry.baseUrl, relativeUrl = C.registry.relativeUrl) {
  if (_extensions.length === 0) {
    _extensions = parsePlugins(C.registry.extensions, C.registry.baseUrl, C.registry.relativeUrl);
  }
  const p = parsePlugin(desc, baseUrl, relativeUrl);
  _extensions.push(p);
  return p;
}

export function pushAll(descs: any[], baseUrl = C.registry.baseUrl, relativeUrl = C.registry.relativeUrl) {
  return descs.map((desc) => push(desc, baseUrl, relativeUrl));
}

/**
 * loads all given plugins at once and returns a promise
 * @param plugins
 * @returns {Promise}
 */
export function load(plugins: IPluginDesc[]) :Promise<IPlugin[]> {
  if (plugins.length === 0) {
    return Promise.resolve([]);
  }
  return new Promise((resolve) => {
    //do we have all instances?
    if (plugins.every(desc => !!(<any>desc).instance) || !!(<any>desc).loader) {
      //loaded now convert to plugins
      resolve(plugins.map((p:any) => {
        const instance = p.instance || p.loader();
        return {
          desc: p,
          impl: instance,
          factory : instance[p.factory]
        };
      }));
    } else {
      //old way
      require(plugins.map((desc) => desc.module), (...impls:any[]) => {
        //loaded now convert to plugins
        resolve(impls.map((p, i) => {
          return {
            desc: plugins[i],
            impl: p,
            factory: p[plugins[i].factory]
          };
        }));
      });
    }
  });
}
