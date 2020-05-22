/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
import { RemoveNodeObserver } from '../internal/RemoveNodeObserver';
import { HashProperties } from '../internal/HashProperties';
import { PropertyHandler } from '../internal/PropertyHandler';
import { BaseUtils } from '../base/BaseUtils';
import { Ajax } from '../base/ajax';
export class AppContext {
    constructor() {
        /**
         * whether the standard api calls should be prevented
         * @type {boolean}
         */
        this.offline = false;
        /* tslint:disable:variable-name */
        /**
         * server prefix ofr api calls
         * @type {string}
         */
        this.server_url = (AppContext.__APP_CONTEXT__ || '/') + 'api';
        /**
         * server suffix for api calls
         * @type {string}
         */
        this.server_json_suffix = '';
        this.removeNodeObserver = new RemoveNodeObserver();
        /**
         * access to hash parameters and set them, too
         * @type {HashProperties}
         */
        this.hash = new HashProperties();
        /**
         * access to get parameters
         * @type {PropertyHandler}
         */
        this.param = new PropertyHandler(location.search);
        this.defaultGenerator = () => Promise.reject('offline');
    }
    /* tslint:enable:variable-name */
    /**
     * initializes certain properties of the core
     * @param config
     */
    init(config = {}) {
        config = BaseUtils.mixin({
            offline: this.offline,
            server_url: this.server_url,
            server_json_suffix: this.server_json_suffix
        }, config);
        this.offline = config.offline;
        this.server_url = config.server_url;
        this.server_json_suffix = config.server_json_suffix;
    }
    isOffline() {
        return this.offline;
    }
    /**
     * initializes itself based on script data attributes
     * @private
     */
    _init() {
        function find(name, camelCaseName = name.slice(0, 1).toUpperCase() + name.slice(1)) {
            const node = document.currentScript || document.querySelector(`script[data-phovea-${name}]`);
            if (!node) {
                return undefined;
            }
            return node.dataset['phovea' + camelCaseName];
        }
        const config = {};
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
    /**
     * utility function to get notified, when the given dom element is removed from its parent
     * @param node
     * @param callback
     */
    onDOMNodeRemoved(node, callback, thisArg) {
        if (Array.isArray(node)) {
            node.forEach((nodeid) => this.removeNodeObserver.observe(nodeid, callback, thisArg));
        }
        else {
            this.removeNodeObserver.observe(node, callback, thisArg);
        }
    }
    /**
     * converts the given api url to an absolute with optional get parameters
     * @param url
     * @param data
     * @returns {string}
     */
    api2absURL(url, data = null) {
        url = `${this.server_url}${url}${this.server_json_suffix}`;
        data = Ajax.encodeParams(data);
        if (data) {
            url += (/\?/.test(url) ? '&' : '?') + data;
        }
        return url;
    }
    setDefaultOfflineGenerator(generator) {
        this.defaultGenerator = generator || (() => Promise.reject('offline'));
    }
    /**
     * handler in case phovea is set to be in offline mode
     * @param generator
     * @param data
     * @param url
     * @returns {Promise<OfflineGenerator>}
     */
    sendOffline(generator, url, data) {
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
    sendAPI(url, data = {}, method = 'GET', expectedDataType = 'json', offlineGenerator = this.defaultGenerator) {
        if (this.isOffline()) {
            return this.sendOffline(offlineGenerator, url, data);
        }
        return Ajax.send(this.api2absURL(url), data, method, expectedDataType);
    }
    /**
     * api version of getJSON
     * @param url api relative url
     * @param data arguments
     * @param offlineGenerator in case of offline flag is set what should be returned
     * @returns {Promise<any>}
     */
    getAPIJSON(url, data = {}, offlineGenerator = this.defaultGenerator) {
        if (this.isOffline()) {
            return this.sendOffline(offlineGenerator, url, data);
        }
        return Ajax.getJSON(this.api2absURL(url), data);
    }
    /**
     * api version of getData
     * @param url api relative url
     * @param data arguments
     * @param expectedDataType expected data type to return, in case of JSON it will be parsed using JSON.parse
     * @param offlineGenerator in case of offline flag is set what should be returned
     * @returns {Promise<any>}
     */
    getAPIData(url, data = {}, expectedDataType = 'json', offlineGenerator = () => this.defaultGenerator) {
        if (this.isOffline()) {
            return this.sendOffline(offlineGenerator, url, data);
        }
        return Ajax.getData(this.api2absURL(url), data, expectedDataType);
    }
    static getInstance() {
        if (!AppContext.instance) {
            AppContext.instance = new AppContext();
            AppContext.instance._init();
        }
        return AppContext.instance;
    }
}
AppContext.context = AppContext.__APP_CONTEXT__;
AppContext.version = AppContext.__VERSION__;
//# sourceMappingURL=AppContext.js.map