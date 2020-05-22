/**
 * Created by Samuel Gratzl on 27.12.2016.
 */
export class UniqueIdManager {
    constructor() {
        /**
         * unique id container
         * @type {{}}
         */
        this.idCounter = new Map();
    }
    /**
     * returns a unique id for the given domain
     * @param domain
     * @return {number}
     */
    uniqueId(domain = '_default') {
        if (!this.idCounter.has(domain)) {
            this.idCounter.set(domain, 0);
        }
        const v = this.idCounter.get(domain);
        this.idCounter.set(domain, v + 1);
        return v;
    }
    flagId(domain, id) {
        if (isNaN(id) || id < 0) {
            return id;
        }
        if (!this.idCounter.has(domain)) {
            this.idCounter.set(domain, id + 1);
        }
        else {
            this.idCounter.set(domain, Math.max(this.idCounter.get(domain), id + 1)); //use the next one afterwards
        }
        return id;
    }
    /**
     * returns a string, which is a unique id for the given domain
     * @param domain
     * @return {string}
     */
    uniqueString(domain = '_default') {
        return domain + this.uniqueId(domain);
    }
    static getInstance() {
        if (!UniqueIdManager.instance) {
            UniqueIdManager.instance = new UniqueIdManager();
        }
        return UniqueIdManager.instance;
    }
}
//# sourceMappingURL=UniqueIdManager.js.map