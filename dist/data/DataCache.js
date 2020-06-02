/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 *
 * This module provides access functions for dataset stored on a server, including functions to list all datasets,
 * to retrieve datasets by names, id types, ids, etc.
 *
 * See IDataDescriptionMetaData in datatype.ts for various legal parameters
 */
import { AppContext } from '../app/AppContext';
import { BaseUtils } from '../base/BaseUtils';
import { PluginRegistry } from '../app/PluginRegistry';
import { DummyDataType } from './datatype';
export class DataCache {
    constructor() {
        //find all datatype plugins
        this.available = PluginRegistry.getInstance().listPlugins('datatype');
        this.cacheById = new Map();
        this.cacheByName = new Map();
        this.cacheByFQName = new Map();
    }
    clearCache(dataset) {
        if (dataset) {
            const desc = dataset.desc || dataset;
            this.cacheById.delete(desc.id);
            this.cacheByName.delete(desc.name);
            this.cacheByFQName.delete(desc.fqname);
        }
        else {
            this.cacheById.clear();
            this.cacheByName.clear();
            this.cacheByFQName.clear();
        }
    }
    getCachedEntries() {
        return Promise.all(Array.from(this.cacheById.values()));
    }
    cached(desc, result) {
        this.cacheById.set(desc.id, result);
        this.cacheByFQName.set(desc.fqname, result);
        this.cacheByName.set(desc.name, result);
        return result;
    }
    /**
     * create an object out of a description
     * @param desc
     * @returns {*}
     */
    async transformEntry(desc) {
        if (desc === undefined) {
            return null;
        }
        desc.id = desc.id || BaseUtils.fixId(desc.name + BaseUtils.randomId(5));
        desc.fqname = desc.fqname || desc.name;
        desc.description = desc.description || '';
        desc.creator = desc.creator || 'Anonymous';
        desc.ts = desc.ts || 0;
        if (this.cacheById.has(desc.id)) {
            return this.cacheById.get(desc.id);
        }
        //find matching type
        const plugin = this.available.filter((p) => p.id === desc.type);
        //no type there create a dummy one
        if (plugin.length === 0) {
            return this.cached(desc, Promise.resolve(new DummyDataType(desc)));
        }
        //take the first matching one
        return this.cached(desc, plugin[0].load().then((d) => d.factory(desc)));
    }
    /**
     * returns a promise for getting a map of all available data
     * @param filter optional filter either a function or a server side interpretable filter object
     * @returns {Promise<IDataType[]>}
     */
    async list(filter) {
        const f = (typeof filter === 'function') ? filter : null;
        const q = (typeof filter !== 'undefined' && typeof filter !== 'function') ? filter : {};
        let r;
        if (AppContext.getInstance().isOffline()) {
            r = this.getCachedEntries();
        }
        else {
            //load descriptions and create data out of them
            r = AppContext.getInstance().getAPIJSON('/dataset/', q).then((r) => Promise.all(r.map(this.transformEntry, this)));
        }
        if (f !== null) {
            r = r.then((d) => d.filter(f));
        }
        return r;
    }
    /**
     * converts a given list of datasets to a tree
     * @param list
     * @returns {{children: Array, name: string, data: null}}
     */
    convertToTree(list) {
        //create a tree out of the list by the fqname
        const root = { children: [], name: '/', data: null };
        list.forEach((entry) => {
            const path = entry.desc.fqname.split('/');
            let act = root;
            path.forEach((node) => {
                let next = act.children.find((d) => d.name === node);
                if (!next) {
                    next = { children: [], name: node, data: null };
                    act.children.push(next);
                }
                act = next;
            });
            act.data = entry;
        });
        return root;
    }
    /**
     * returns a tree of all available datasets
     */
    async tree(filter) {
        return this.convertToTree(await this.list(filter));
    }
    /**
     * Returns the first dataset matching the given query
     * @param query
     * @returns {any}
     */
    async getFirst(query) {
        if (typeof query === 'string' || query instanceof RegExp) {
            return this.getFirstByName(query);
        }
        const q = query;
        q.limit = 1;
        const result = await this.list(q);
        if (result.length === 0) {
            return Promise.reject({ error: 'nothing found, matching', args: q });
        }
        return Promise.resolve(result[0]);
    }
    /*function escapeRegExp(string){
    return string.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
    }*/
    getFirstByName(name) {
        return this.getFirstWithCache(name, this.cacheByName, 'name');
    }
    getFirstByFQName(name) {
        return this.getFirstWithCache(name, this.cacheByFQName, 'fqname');
    }
    getFirstWithCache(name, cache, attr) {
        const r = typeof name === 'string' ? new RegExp(name) : name;
        for (const [k, v] of Array.from(cache.entries())) {
            if (r.test(k)) {
                return v;
            }
        }
        return this.getFirst({
            [attr]: typeof name === 'string' ? name : name.source
        });
    }
    /**
     * Returns a promise for getting dataset based on a specific ID.
     * @param id the ID, as defined in IDataDescriptionData#id
     * @returns {Promise<any>}
     */
    async getById(id) {
        if (this.cacheById.has(id)) {
            return this.cacheById.get(id);
        }
        return this.transformEntry(await AppContext.getInstance().getAPIJSON(`/dataset/${id}/desc`));
    }
    /**
     * Returns a promise for getting a specific dataset
     * @param a persisted id or persisted object containing the id
     * @returns {Promise<IDataType>}
     */
    async get(persisted) {
        if (typeof persisted === 'string') {
            return this.getById(persisted);
        }
        //resolve parent and then resolve it using restore item
        if (persisted.root) {
            const parent = await this.get(persisted.root);
            return parent ? parent.restore(persisted) : null;
        }
        else {
            //can't restore non root and non data id
            return Promise.reject('cannot restore non root and non data id');
        }
    }
    /**
     * creates a new dataset for the given description
     * @param desc
     * @returns {Promise<IDataType>}
     */
    create(desc) {
        return this.transformEntry(desc);
    }
    prepareData(desc, file) {
        const data = new FormData();
        data.append('desc', JSON.stringify(desc));
        if (file) {
            data.append('file', file);
        }
        return data;
    }
    /**
     * uploads a given dataset description with optional file attachment ot the server
     * @param data
     * @param file
     * @returns {Promise<*>}
     */
    async upload(data, file) {
        data = this.prepareData(data, file);
        return this.transformEntry(await AppContext.getInstance().sendAPI('/dataset/', data, 'POST'));
    }
    /**
     * updates an existing dataset with a new description and optional file
     * @returns {Promise<*>} returns the update dataset
     */
    async update(entry, data, file) {
        data = this.prepareData(data, file);
        const desc = await AppContext.getInstance().sendAPI(`/dataset/${entry.desc.id}`, data, 'PUT');
        // clear existing cache
        this.clearCache(entry);
        //update with current one
        return this.transformEntry(desc);
    }
    /**
     * modifies an existing dataset with a new description and optional file, the difference to update is that this should be used for partial changes
     * @returns {Promise<*>} returns the update dataset
     */
    async modify(entry, data, file) {
        data = this.prepareData(data, file);
        const desc = await AppContext.getInstance().sendAPI(`/dataset/${entry.desc.id}`, data, 'POST');
        this.clearCache(entry);
        return this.transformEntry(desc);
    }
    /**
     * removes a given dataset
     * @param entry
     * @returns {Promise<boolean>}
     */
    async remove(entry) {
        const desc = entry.desc || entry;
        await AppContext.getInstance().sendAPI(`/dataset/${desc.id}`, {}, 'DELETE');
        this.clearCache(desc);
        return true;
    }
    static getInstance() {
        if (!DataCache.instance) {
            DataCache.instance = new DataCache();
        }
        return DataCache.instance;
    }
}
//# sourceMappingURL=DataCache.js.map