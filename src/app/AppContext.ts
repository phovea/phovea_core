/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

import {RemoveNodeObserver} from '../internal/RemoveNodeObserver';
import {HashProperties} from '../base/HashProperties';
import {PropertyHandler} from '../base/PropertyHandler';
import {BaseUtils} from '../base/BaseUtils';
import {Ajax} from '../base/ajax';
import {WebpackEnv} from '../base/WebpackEnv';

type OfflineGenerator = ((data: any, url: string) => Promise<any>) | Promise<any> | any;

export class AppContext {

  /**
   * whether the standard api calls should be prevented
   * @type {boolean}
   */
  public offline = false;
  public static context = WebpackEnv.__APP_CONTEXT__;

  /**
   * version of the core
   */
  public static version = WebpackEnv.__VERSION__;

  /* tslint:disable:variable-name */
  /**
   * server prefix ofr api calls
   * @type {string}
   */
  public server_url: string = (WebpackEnv.__APP_CONTEXT__ || '/') + 'api';
  /**
   * server suffix for api calls
   * @type {string}
   */
  public server_json_suffix: string = '';
  /* tslint:enable:variable-name */

  /**
   * initializes certain properties of the core
   * @param config
   */
  public init(config: {offline?: boolean, server_url?: string, server_json_suffix?: string} = {}) {
    config = BaseUtils.mixin({
      offline: this.offline,
      server_url: this.server_url,
      server_json_suffix: this.server_json_suffix
    }, config);
    this.offline = config.offline;
    this.server_url = config.server_url;
    this.server_json_suffix = config.server_json_suffix;
  }
  public isOffline() {
    return this.offline;
  }
  /**
   * initializes itself based on script data attributes
   * @private
   */
  protected _init() {
    function find(name: string, camelCaseName = name.slice(0, 1).toUpperCase() + name.slice(1)) {
      const node: HTMLElement = <HTMLElement>document.currentScript || <HTMLElement>document.querySelector(`script[data-phovea-${name}]`);
      if (!node) {
        return undefined;
      }
      return node.dataset['phovea' + camelCaseName];
    }

    const config: any = {};
    if ('true' === find('offline')) {
      config.offline = true;
    }
    let v;
    if ((v = find('server-url', 'ServerUrl')) !== undefined) {
      config.server_url = v;
    }
    if ((v = find('server-json-suffix', 'ServerJsonSuffix')) !== undefined) {
      config.server_json_suffix = v;
    }
    //init myself
    this.init(config);
  }

  private removeNodeObserver = new RemoveNodeObserver();

  /**
   * utility function to get notified, when the given dom element is removed from its parent
   * @param node
   * @param callback
   */
  public onDOMNodeRemoved(node: Element|Element[], callback: () => void, thisArg?: any) {
    if (Array.isArray(node)) {
      node.forEach((nodeid) => AppContext.getInstance().removeNodeObserver.observe(nodeid, callback, thisArg));
    } else {
      AppContext.getInstance().removeNodeObserver.observe(node, callback, thisArg);
    }
  }

  /**
   * access to hash parameters and set them, too
   * @type {HashProperties}
   */
  public hash = new HashProperties();
  /**
   * access to get parameters
   * @type {PropertyHandler}
   */
  public param = new PropertyHandler(location.search);

  /**
   * converts the given api url to an absolute with optional get parameters
   * @param url
   * @param data
   * @returns {string}
   */
  public api2absURL(url: string, data: any = null) {
    url = `${AppContext.getInstance().server_url}${url}${AppContext.getInstance().server_json_suffix}`;
    data = Ajax.encodeParams(data);
    if (data) {
      url += (/\?/.test(url) ? '&' : '?') + data;
    }
    return url;
  }


  private defaultGenerator: OfflineGenerator = () => Promise.reject('offline');

  public setDefaultOfflineGenerator(generator: OfflineGenerator | null) {
    AppContext.getInstance().defaultGenerator = generator || (() => Promise.reject('offline'));
  }

  /**
   * handler in case phovea is set to be in offline mode
   * @param generator
   * @param data
   * @param url
   * @returns {Promise<OfflineGenerator>}
   */
  private sendOffline(generator: OfflineGenerator, url: string, data: any) {
    return Promise.resolve(typeof generator === 'function' ? generator(data, url) : generator);
  }

  /**
   * api version of send
   * @param url api relative url
   * @param data arguments
   * @param method http method
   * @param expectedDataType expected data type to return, in case of JSON it will be parsed using JSON.parse
   * @param offlineGenerator in case phovea is set to be offline
   * @returns {Promise<any>}
   */
  public sendAPI(url: string, data: any = {}, method = 'GET', expectedDataType = 'json', offlineGenerator: OfflineGenerator = AppContext.getInstance().defaultGenerator): Promise<any> {
    if (AppContext.getInstance().isOffline()) {
      return AppContext.getInstance().sendOffline(offlineGenerator, url, data);
    }
    return Ajax.send(AppContext.getInstance().api2absURL(url), data, method, expectedDataType);
  }

  /**
   * api version of getJSON
   * @param url api relative url
   * @param data arguments
   * @param offlineGenerator in case of offline flag is set what should be returned
   * @returns {Promise<any>}
   */
  public getAPIJSON(url: string, data: any = {}, offlineGenerator: OfflineGenerator = AppContext.getInstance().defaultGenerator): Promise<any> {
    if (AppContext.getInstance().isOffline()) {
      return AppContext.getInstance().sendOffline(offlineGenerator, url, data);
    }
    return Ajax.getJSON(AppContext.getInstance().api2absURL(url), data);
  }

  /**
   * api version of getData
   * @param url api relative url
   * @param data arguments
   * @param expectedDataType expected data type to return, in case of JSON it will be parsed using JSON.parse
   * @param offlineGenerator in case of offline flag is set what should be returned
   * @returns {Promise<any>}
   */
  public getAPIData(url: string, data: any = {}, expectedDataType = 'json', offlineGenerator: OfflineGenerator = () => AppContext.getInstance().defaultGenerator): Promise<any> {
    if (AppContext.getInstance().isOffline()) {
      return AppContext.getInstance().sendOffline(offlineGenerator, url, data);
    }
    return Ajax.getData(AppContext.getInstance().api2absURL(url), data, expectedDataType);
  }

  private static instance: AppContext;

  public static getInstance(): AppContext {
    if (!AppContext.instance) {
      AppContext.instance = new AppContext();
      AppContext.instance._init();
    }

    return AppContext.instance;
  }
}
