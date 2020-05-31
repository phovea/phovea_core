/**
 * Created by sam on 26.12.2016.
 */
import { AppContext } from '../app/AppContext';
import { EventHandler } from '../base/event';
import { SelectionUtils } from './SelectionUtils';
import { IDType } from './IDType';
import { ProductIDType } from './ProductIDType';
import { PluginRegistry } from '../app/PluginRegistry';
import { ParseRangeUtils } from '../range';
export class IDTypeManager {
    constructor() {
        this.cache = new Map();
        this.filledUp = false;
        //register known idtypes via registry
        PluginRegistry.getInstance().listPlugins(IDTypeManager.EXTENSION_POINT_IDTYPE).forEach((plugin) => {
            const id = plugin.id;
            const name = plugin.name;
            const names = plugin.names || this.toPlural(name);
            const internal = Boolean(plugin.internal);
            this.registerIdType(id, new IDType(id, name, names, internal));
        });
    }
    fillUpData(entries) {
        entries.forEach(function (row) {
            let entry = this.cache.get(row.id);
            let newOne = false;
            if (entry) {
                if (entry instanceof IDType) {
                    entry.name = row.name;
                    entry.names = row.names;
                }
            }
            else {
                entry = new IDType(row.id, row.name, row.names);
                newOne = true;
            }
            this.cache.set(row.id, entry);
            if (newOne) {
                EventHandler.getInstance().fire(IDTypeManager.EVENT_REGISTER_IDTYPE, entry);
            }
        });
    }
    toPlural(name) {
        if (name[name.length - 1] === 'y') {
            return name.slice(0, name.length - 1) + 'ies';
        }
        return name + 's';
    }
    resolveIdType(id) {
        if (id instanceof IDType) {
            return id;
        }
        else {
            const sid = id;
            return this.registerIdType(sid, new IDType(sid, sid, this.toPlural(sid)));
        }
    }
    resolveProduct(...idtypes) {
        const p = new ProductIDType(idtypes);
        return this.registerIdType(p.id, p);
    }
    /**
     * list currently resolved idtypes
     * @returns {Array<IDType|ProductIDType>}
     */
    listIdTypes() {
        return Array.from(this.cache.values());
    }
    /**
     * Get a list of all IIDTypes available on both the server and the client.
     * @returns {any}
     */
    async listAllIdTypes() {
        if (this.filledUp) {
            return Promise.resolve(this.listIdTypes());
        }
        const c = await AppContext.getInstance().getAPIJSON('/idtype/', {}, []);
        this.filledUp = true;
        this.fillUpData(c);
        return this.listIdTypes();
    }
    registerIdType(id, idtype) {
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        this.cache.set(id, idtype);
        EventHandler.getInstance().fire('register.idtype', idtype);
        return idtype;
    }
    persistIdTypes() {
        const r = {};
        this.cache.forEach((v, id) => {
            r[id] = v.persist();
        });
        return r;
    }
    restoreIdType(persisted) {
        Object.keys(persisted).forEach((id) => {
            this.resolveIdType(id).restore(persisted[id]);
        });
    }
    clearSelection(type = SelectionUtils.defaultSelectionType) {
        this.cache.forEach((v) => v.clear(type));
    }
    /**
     * whether the given idtype is an internal one or not, i.e. the internal flag is set or it starts with an underscore
     * @param idtype
     * @return {boolean}
     */
    isInternalIDType(idtype) {
        return idtype.internal || idtype.id.startsWith('_');
    }
    /**
     * search for all matching ids for a given pattern
     * @param pattern
     * @param limit maximal number of results
     * @return {Promise<void>}
     */
    searchMapping(idType, pattern, toIDType, limit = 10) {
        const target = IDTypeManager.getInstance().resolveIdType(toIDType);
        return AppContext.getInstance().getAPIJSON(`/idtype/${idType.id}/${target.id}/search`, { q: pattern, limit });
    }
    /**
     * returns the list of idtypes that this type can be mapped to
     * @returns {Promise<IDType[]>}
     */
    getCanBeMappedTo(idType) {
        if (idType.canBeMappedTo === null) {
            idType.canBeMappedTo = AppContext.getInstance().getAPIJSON(`/idtype/${idType.id}/`).then((list) => list.map(IDTypeManager.getInstance().resolveIdType));
        }
        return idType.canBeMappedTo;
    }
    mapToFirstName(idType, ids, toIDType) {
        const target = IDTypeManager.getInstance().resolveIdType(toIDType);
        const r = ParseRangeUtils.parseRangeLike(ids);
        return IDType.chooseRequestMethod(`/idtype/${idType.id}/${target.id}`, { ids: r.toString(), mode: 'first' });
    }
    mapNameToFirstName(idType, names, toIDtype) {
        const target = IDTypeManager.getInstance().resolveIdType(toIDtype);
        return IDType.chooseRequestMethod(`/idtype/${idType.id}/${target.id}`, { q: names, mode: 'first' });
    }
    mapToName(idType, ids, toIDType) {
        const target = IDTypeManager.getInstance().resolveIdType(toIDType);
        const r = ParseRangeUtils.parseRangeLike(ids);
        return IDType.chooseRequestMethod(`/idtype/${idType.id}/${target.id}`, { ids: r.toString() });
    }
    mapNameToName(idType, names, toIDtype) {
        const target = IDTypeManager.getInstance().resolveIdType(toIDtype);
        return IDType.chooseRequestMethod(`/idtype/${idType.id}/${target.id}`, { q: names });
    }
    mapToFirstID(idType, ids, toIDType) {
        const target = IDTypeManager.getInstance().resolveIdType(toIDType);
        const r = ParseRangeUtils.parseRangeLike(ids);
        return IDType.chooseRequestMethod(`/idtype/${idType.id}/${target.id}/map`, { ids: r.toString(), mode: 'first' });
    }
    mapToID(idType, ids, toIDType) {
        const target = IDTypeManager.getInstance().resolveIdType(toIDType);
        const r = ParseRangeUtils.parseRangeLike(ids);
        return IDType.chooseRequestMethod(`/idtype/${idType.id}/${target.id}/map`, { ids: r.toString() });
    }
    mapNameToFirstID(idType, names, toIDType) {
        const target = IDTypeManager.getInstance().resolveIdType(toIDType);
        return IDType.chooseRequestMethod(`/idtype/${idType.id}/${target.id}/map`, { q: names, mode: 'first' });
    }
    mapNameToID(idType, names, toIDType) {
        const target = IDTypeManager.getInstance().resolveIdType(toIDType);
        return IDType.chooseRequestMethod(`/idtype/${idType.id}/${target.id}/map`, { q: names });
    }
    findMappablePlugins(target, all) {
        if (!target) {
            return [];
        }
        const idTypes = Array.from(new Set(all.map((d) => d.idtype)));
        function canBeMappedTo(idtype) {
            if (idtype === target.id) {
                return true;
            }
            // lookup the targets and check if our target is part of it
            return IDTypeManager.getInstance().getCanBeMappedTo(IDTypeManager.getInstance().resolveIdType(idtype)).then((mappables) => mappables.some((d) => d.id === target.id));
        }
        // check which idTypes can be mapped to the target one
        return Promise.all(idTypes.map(canBeMappedTo)).then((mappable) => {
            const valid = idTypes.filter((d, i) => mappable[i]);
            return all.filter((d) => valid.indexOf(d.idtype) >= 0);
        });
    }
    static getInstance() {
        if (!IDTypeManager.instance) {
            IDTypeManager.instance = new IDTypeManager();
        }
        return IDTypeManager.instance;
    }
}
IDTypeManager.EXTENSION_POINT_IDTYPE = 'idType';
IDTypeManager.EVENT_REGISTER_IDTYPE = 'register.idtype';
//# sourceMappingURL=IDTypeManager.js.map